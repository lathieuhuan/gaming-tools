import { Object_ } from "ron-utils";

import type { Artifact, ArtifactCloneOptions, Character, Target, Teammate, Weapon } from "@/models";
import type {
  AbilityBuffCtrl,
  AbilityDebuffCtrl,
  AppCharacter,
  ArtifactBuffCtrl,
  ArtifactDebuffCtrl,
  ArtifactSubStat,
  ArtifactType,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  RawArtifactState,
  RawCharacterState,
  RawWeaponState,
  ResonanceModCtrl,
  TalentCalcItem,
  TeamBuffCtrl,
  TeammateArtifact,
  TeammateData,
  TeammateWeapon,
  WeaponBuffCtrl,
} from "@/types";
import type { CalcResult } from "../types";

import { createTeammate } from "@/logic/entity.logic";
import {
  createArtifactBuffCtrls,
  createMainArtifactBuffCtrls,
  createWeaponBuffCtrls,
} from "@/logic/modifier.logic";
import { ArtifactGear } from "@/models";
import { Team } from "../Team";
import { syncArtifactDebuffCtrls, syncRsnModCtrls, syncTeamBuffCtrls } from "./sync";

type TeammateUpdateData = Partial<
  Pick<TeammateData, "weapon" | "artifact" | "buffCtrls" | "debuffCtrls" | "enhanced">
>;

export class CalcSetupCore {
  calcItems: TalentCalcItem[];

  protected constructor(
    public ID: number,

    public main: Character,
    public teammates: Teammate[],
    public team: Team,
    public target: Target,

    public selfBuffCtrls: AbilityBuffCtrl[],
    public selfDebuffCtrls: AbilityDebuffCtrl[],

    public wpBuffCtrls: WeaponBuffCtrl[],
    public artBuffCtrls: ArtifactBuffCtrl[],
    public artDebuffCtrls: ArtifactDebuffCtrl[],

    public teamBuffCtrls: TeamBuffCtrl[],
    public rsnBuffCtrls: ResonanceModCtrl[],
    public rsnDebuffCtrls: ResonanceModCtrl[],
    public elmtEvent: ElementalEvent,
    public customBuffCtrls: CustomBuffCtrl[],
    public customDebuffCtrls: CustomDebuffCtrl[],

    public result: CalcResult,
  ) {
    this.calcItems = [];
  }

  updateMainState(data: Partial<RawCharacterState>) {
    this.main = this.main.clone(data);
    this.team = new Team([this.main, ...this.teammates]);
  }

  // ===== WEAPON =====

  switchMainWeapon(weapon: Weapon) {
    this.main.weapon = weapon.clone();
    this.wpBuffCtrls = createWeaponBuffCtrls(weapon.data, true);
  }

  updateMainWeapon(data: Partial<RawWeaponState>) {
    this.main.weapon = this.main.weapon.clone(data);
  }

  // ===== ARTIFACTS =====

  setArtifactGear(newAtfGear: ArtifactGear) {
    this.main.atfGear = newAtfGear;
    this.artBuffCtrls = createMainArtifactBuffCtrls(newAtfGear.sets);
    syncTeamBuffCtrls(this);
    syncArtifactDebuffCtrls(this);
  }

  setArtifactPiece(artifact: Artifact, shouldKeepStats = false) {
    const pieces = { ...this.main.atfGear.pieces };
    const oldPiece = pieces[artifact.type];
    const cloneOptions: ArtifactCloneOptions =
      shouldKeepStats && oldPiece
        ? {
            type: oldPiece.type,
            rarity: artifact.rarity,
            level: oldPiece.level,
            mainStatType: oldPiece.mainStatType,
            subStats: oldPiece.subStats,
          }
        : {};

    pieces[artifact.type] = artifact.clone(cloneOptions);

    this.setArtifactGear(ArtifactGear.create(pieces));
  }

  removeArtifactPiece(type: ArtifactType) {
    const pieces = {
      ...this.main.atfGear.pieces,
      [type]: undefined,
    };

    this.setArtifactGear(ArtifactGear.create(pieces));
  }

  updateArtifactPiece(type: ArtifactType, newState: Partial<RawArtifactState>) {
    const { pieces } = this.main.atfGear;
    const piece = pieces[type];

    if (piece === undefined) {
      return false;
    }

    this.main.atfGear = ArtifactGear.create({
      ...pieces,
      [type]: piece.clone(newState),
    });
  }

  updateArtifactPieceSubStat(type: ArtifactType, index: number, data: Partial<ArtifactSubStat>) {
    const { pieces } = this.main.atfGear;
    const piece = pieces[type];

    if (piece === undefined) {
      return false;
    }

    piece.updateSubStat(index, data);

    this.main.atfGear = ArtifactGear.create({
      ...pieces,
      [type]: piece.clone(),
    });
  }

  copyArtifacts(setup: CalcSetupCore) {
    this.main.atfGear = setup.main.atfGear.deepClone();
    this.artBuffCtrls = Object_.clone(setup.artBuffCtrls);
    this.artDebuffCtrls = Object_.clone(setup.artDebuffCtrls); // TODO check
    syncArtifactDebuffCtrls(this);
    syncTeamBuffCtrls(this);
  }

  // ===== TEAMMATES =====

  setTeammate(data: AppCharacter, index: number) {
    const newTeammates = [...this.teammates];

    newTeammates[index] = createTeammate({ code: data.code }, data);

    this.team = new Team([this.main, ...newTeammates]);
    this.teammates = newTeammates;
    syncRsnModCtrls(this);
    syncTeamBuffCtrls(this);
    syncArtifactDebuffCtrls(this);
  }

  /**
   * Does NOT create new reference for Team,
   * be careful when using for updates that involve changes in Team
   */
  private updateTeammate(
    tmCode: number,
    data: TeammateUpdateData | ((teammate: Teammate) => TeammateUpdateData),
  ) {
    this.teammates = this.teammates.map((teammate) => {
      if (teammate.data.code === tmCode) {
        const updateData = typeof data === "function" ? data(teammate) : data;
        return teammate.update({ ...updateData });
      }

      return teammate;
    });

    // this.team.updateMembers([this.main, ...this.teammates]);
    syncArtifactDebuffCtrls(this);
  }

  updateTeammateModCtrls(
    tmCode: number,
    data: Partial<Pick<TeammateData, "buffCtrls" | "debuffCtrls">>,
  ) {
    this.updateTeammate(tmCode, data);
  }

  toggleTeammateEnhance(tmCode: number, enhanced?: boolean) {
    const teammate = this.teammates.find((teammate) => teammate.data.code === tmCode);

    if (!teammate) {
      return false;
    }

    this.updateTeammate(tmCode, {
      enhanced: enhanced ?? !teammate.enhanced,
    });

    this.team = new Team([this.main, ...this.teammates]);
  }

  removeTeammate(teammate: Teammate) {
    const newTeammates = this.teammates.filter((tm) => tm.code !== teammate.code);

    this.team = new Team([this.main, ...newTeammates]);
    this.teammates = newTeammates;
    syncRsnModCtrls(this);
    syncTeamBuffCtrls(this);
    syncArtifactDebuffCtrls(this);
  }

  copyTeammates(setup: CalcSetupCore) {
    this.teammates = setup.teammates.map((teammate) => teammate.deepClone());
    this.team = new Team([this.main, ...this.teammates]);
    this.rsnBuffCtrls = Object_.clone(setup.rsnBuffCtrls);
    this.rsnDebuffCtrls = Object_.clone(setup.rsnDebuffCtrls);
    this.artDebuffCtrls = Object_.clone(setup.artDebuffCtrls); // TODO check
    syncTeamBuffCtrls(this);
    syncArtifactDebuffCtrls(this);
  }

  changeTeammateWeapon(tmCode: number, weapon: Weapon) {
    this.updateTeammate(tmCode, {
      weapon: {
        code: weapon.code,
        type: weapon.type,
        refi: weapon.refi,
        buffCtrls: createWeaponBuffCtrls(weapon.data, false),
        data: weapon.data,
      },
    });
  }

  updateTeammateWeapon(tmCode: number, data: Partial<Pick<TeammateWeapon, "refi" | "buffCtrls">>) {
    this.updateTeammate(tmCode, (teammate) => ({
      weapon: {
        ...teammate.weapon,
        ...data,
      },
    }));
  }

  changeTeammateArtifact(tmCode: number, artifact: Artifact | undefined) {
    this.updateTeammate(tmCode, {
      artifact: artifact && {
        code: artifact.code,
        buffCtrls: createArtifactBuffCtrls(artifact.data, false),
        data: artifact.data,
      },
    });

    syncTeamBuffCtrls(this);
  }

  updateTeammateArtifact(tmCode: number, data: Partial<Pick<TeammateArtifact, "buffCtrls">>) {
    this.updateTeammate(tmCode, (teammate) => ({
      artifact: teammate.artifact && {
        ...teammate.artifact,
        ...data,
      },
    }));
  }

  // ===== ELEMENTAL EVENT =====

  updateElementalEvent(data: Partial<ElementalEvent>) {
    this.elmtEvent = {
      ...this.elmtEvent,
      ...data,
    };
  }
}

type VoidedReturn<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => any ? (...args: Args) => void : T[K];
};

export type CalcSetupActions = VoidedReturn<
  Pick<
    CalcSetupCore,
    | "updateMainState"
    | "switchMainWeapon"
    | "updateMainWeapon"
    | "setArtifactGear"
    | "setArtifactPiece"
    | "removeArtifactPiece"
    | "updateArtifactPiece"
    | "updateArtifactPieceSubStat"
    | "copyArtifacts"
    | "setTeammate"
    | "updateTeammateModCtrls"
    | "toggleTeammateEnhance"
    | "removeTeammate"
    | "copyTeammates"
    | "changeTeammateWeapon"
    | "updateTeammateWeapon"
    | "changeTeammateArtifact"
    | "updateTeammateArtifact"
    | "updateElementalEvent"
  >
>;

import { Object_ } from "ron-utils";

import type { Artifact, ArtifactCloneOptions, Character, Teammate, Weapon } from "@/models";
import type {
  AppCharacter,
  ArtifactSubStat,
  ArtifactType,
  ElementalEvent,
  RawArtifactState,
  RawCharacterState,
  RawWeaponState,
  TeammateArtifact,
  TeammateData,
  TeammateWeapon,
} from "@/types";

import { createTarget, createTeammate } from "@/logic/entity.logic";
import {
  createAbilityBuffCtrls,
  createAbilityDebuffCtrls,
  createArtifactBuffCtrls,
  createArtifactDebuffCtrls,
  createElementalEvent,
  createMainArtifactBuffCtrls,
  createRsnModCtrls,
  createWeaponBuffCtrls,
} from "@/logic/modifier.logic";
import { ArtifactGear } from "@/models";

import { Team } from "../Team";
import { calculateSetup, CalculateSetupOptions } from "../calculateSetup";
import { createTeamBuffCtrls } from "../createTeamBuffCtrls";
import { CalcSetupCore } from "./CalcSetupCore";
import { syncArtifactDebuffCtrls, syncRsnModCtrls, syncTeamBuffCtrls } from "./sync";

export type CreateCalcSetupOptions = Partial<
  Pick<
    CalcSetupCore,
    | "selfBuffCtrls"
    | "selfDebuffCtrls"
    | "wpBuffCtrls"
    | "teammates"
    | "artBuffCtrls"
    | "artDebuffCtrls"
    | "teamBuffCtrls"
    | "rsnBuffCtrls"
    | "rsnDebuffCtrls"
    | "elmtEvent"
    | "customBuffCtrls"
    | "customDebuffCtrls"
    | "target"
  >
>;

type TeammateUpdateData = Partial<
  Pick<TeammateData, "weapon" | "artifact" | "buffCtrls" | "debuffCtrls" | "enhanced">
>;

export class CalcSetup extends CalcSetupCore {
  //
  calculate(options?: CalculateSetupOptions) {
    return calculateSetup(this, options);
  }

  // TODO check
  clone(options: { ID?: number } = {}) {
    const { ID = this.ID } = options;
    const main = this.main.deepClone();
    const teammates = this.teammates.map((teammate) => teammate.clone());
    const team = new Team([main, ...teammates]);
    const target = this.target.clone();

    return new CalcSetup(
      ID,
      main,
      teammates,
      team,
      target,
      this.selfBuffCtrls,
      this.selfDebuffCtrls,
      this.wpBuffCtrls,
      this.artBuffCtrls,
      this.artDebuffCtrls,
      this.teamBuffCtrls,
      this.rsnBuffCtrls,
      this.rsnDebuffCtrls,
      this.elmtEvent,
      this.customBuffCtrls,
      this.customDebuffCtrls,
      this.result,
    );
  }

  static create(id: number, main: Character, options: CreateCalcSetupOptions = {}) {
    const {
      selfBuffCtrls = createAbilityBuffCtrls(main.data, true),
      selfDebuffCtrls = createAbilityDebuffCtrls(main.data, true),
      wpBuffCtrls = createWeaponBuffCtrls(main.weapon.data, true),
      teammates = [],
      artBuffCtrls = createMainArtifactBuffCtrls(main.atfGear.sets),
      artDebuffCtrls = createArtifactDebuffCtrls(main.atfGear.sets, teammates),
      elmtEvent = createElementalEvent(),
      customBuffCtrls = [],
      customDebuffCtrls = [],
      target = createTarget(),
    } = options;

    const team = new Team([main, ...teammates]);
    const defaultRsnModCtrls = createRsnModCtrls(team.elmtCount);
    const {
      rsnBuffCtrls = defaultRsnModCtrls.buffCtrls,
      rsnDebuffCtrls = defaultRsnModCtrls.debuffCtrls,
    } = options;

    const result = {
      NAs: {},
      ES: {},
      EB: {},
      XTRA: {},
      RXN: {},
      WP: {},
    };

    const setup = new CalcSetup(
      id,
      main,
      teammates,
      team,
      target,
      selfBuffCtrls,
      selfDebuffCtrls,
      wpBuffCtrls,
      artBuffCtrls,
      artDebuffCtrls,
      [],
      rsnBuffCtrls,
      rsnDebuffCtrls,
      elmtEvent,
      customBuffCtrls,
      customDebuffCtrls,
      result,
    );

    const { teamBuffCtrls = createTeamBuffCtrls(setup) } = options;

    setup.teamBuffCtrls = teamBuffCtrls;

    return setup;
  }

  // I ===== UPDATE LOGIC =====

  updateMainState(data: Partial<RawCharacterState>) {
    this.main = this.main.clone(data);
    this.team = new Team([this.main, ...this.teammates]);
  }

  // II ===== WEAPON =====

  switchMainWeapon(weapon: Weapon) {
    this.main.weapon = weapon.clone();
    this.wpBuffCtrls = createWeaponBuffCtrls(weapon.data, true);
  }

  updateMainWeapon(data: Partial<RawWeaponState>) {
    this.main.weapon = this.main.weapon.clone(data);
  }

  // II ===== ARTIFACTS =====

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

  copyArtifacts(setup: CalcSetup) {
    setup.main.atfGear = setup.main.atfGear.deepClone();
    setup.artBuffCtrls = Object_.clone(setup.artBuffCtrls);
    setup.artDebuffCtrls = Object_.clone(setup.artDebuffCtrls); // TODO check
    syncArtifactDebuffCtrls(setup);
    syncTeamBuffCtrls(setup);
  }

  // III ===== TEAMMATES =====

  setTeammate(data: AppCharacter, index: number) {
    const newTeammates = [...this.teammates];

    newTeammates[index] = createTeammate({ code: data.code }, data);

    this.team = new Team([this.main, ...newTeammates]);
    this.teammates = newTeammates;
    syncRsnModCtrls(this);
    syncTeamBuffCtrls(this);
    syncArtifactDebuffCtrls(this);
  }

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

    // TODO check if not trigger render on Team subscribers
    this.team.updateMembers([this.main, ...this.teammates]);
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

  copyTeammates(setup: CalcSetup) {
    setup.teammates = setup.teammates.map((teammate) => teammate.clone());
    setup.team = new Team([setup.main, ...setup.teammates]);
    setup.rsnBuffCtrls = Object_.clone(setup.rsnBuffCtrls);
    setup.rsnDebuffCtrls = Object_.clone(setup.rsnDebuffCtrls);
    setup.artDebuffCtrls = Object_.clone(setup.artDebuffCtrls); // TODO check
    syncTeamBuffCtrls(setup);
    syncArtifactDebuffCtrls(setup);
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

  // IV ===== ELEMENTAL EVENT =====

  updateElementalEvent(data: Partial<ElementalEvent>) {
    this.elmtEvent = {
      ...this.elmtEvent,
      ...data,
    };
  }
}

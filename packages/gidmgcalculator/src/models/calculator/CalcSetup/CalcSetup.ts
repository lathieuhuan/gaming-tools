import type { PartiallyRequiredOnly } from "rond";
import type {
  AppArtifact,
  AppCharacter,
  ArtifactType,
  IArtifactBasic,
  ITeammate,
  IWeapon,
} from "@/types";
import type { ArtifactPieceUpdateData, CloneOptions, MainUpdateData } from "./types";

import { calculateSetup } from "@/calculation/calculator";
import { Artifact, ArtifactGear, CalcCharacter, Team, Weapon } from "@/models/base";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import Array_ from "@/utils/Array";
import { createArtifactBasic, CreateArtifactParams, createTarget } from "@/utils/entity-utils";
import { CalcTeammate, type CalcTeammateConstructInfo } from "../CalcTeammate";
import {
  createAbilityBuffCtrls,
  createAbilityDebuffCtrls,
  createArtifactBuffCtrls,
  createArtifactDebuffCtrls,
  createElementalEvent,
  createMainArtifactBuffCtrls,
  createRsnModCtrls,
  createTeamBuffCtrls,
  createWeaponBuffCtrls,
} from "../modifier";
import { CalcSetupBase, type CalcSetupBaseConstructInfo } from "./CalcSetupBase";

type TeammateUpdateData = Partial<
  Pick<ITeammate, "weapon" | "artifact" | "buffCtrls" | "debuffCtrls" | "enhanced">
>;

export type CalcSetupConstructInfo = PartiallyRequiredOnly<CalcSetupBaseConstructInfo, "main">;

export class CalcSetup extends CalcSetupBase {
  //
  constructor(info: CalcSetupConstructInfo) {
    const { main } = info;
    const {
      ID = Date.now(),
      selfBuffCtrls = createAbilityBuffCtrls(main.data, true),
      selfDebuffCtrls = createAbilityDebuffCtrls(main.data, true),
      wpBuffCtrls = createWeaponBuffCtrls(main.weapon.data, true),
      teammates = [],
      artBuffCtrls = createMainArtifactBuffCtrls(main.atfGear.sets),
      artDebuffCtrls = createArtifactDebuffCtrls(main.atfGear.sets, teammates),
      team = new Team([main, ...teammates]),
      elmtEvent = createElementalEvent(),
      customBuffCtrls = [],
      customDebuffCtrls = [],
      target = createTarget({ code: 0 }),
      result = {
        NAs: {},
        ES: {},
        EB: {},
        RXN: {},
        WP: {},
      },
    } = info;
    const defaultRsnModCtrls = createRsnModCtrls(team);
    const {
      rsnBuffCtrls = defaultRsnModCtrls.buffCtrls,
      rsnDebuffCtrls = defaultRsnModCtrls.debuffCtrls,
    } = info;

    super({
      ID,
      main,
      selfBuffCtrls,
      selfDebuffCtrls,
      wpBuffCtrls,
      artBuffCtrls,
      artDebuffCtrls,
      rsnBuffCtrls,
      rsnDebuffCtrls,
      elmtEvent,
      customBuffCtrls,
      customDebuffCtrls,
      teamBuffCtrls: [],
      teammates,
      team,
      target,
      result,
    });

    this.teamBuffCtrls = info.teamBuffCtrls || createTeamBuffCtrls(this);
  }

  clone(options: CloneOptions = {}) {
    const { ID = this.ID } = options;
    const main = this.cloneMain();
    const teammates = this.teammates.map((teammate) => teammate.clone());
    const team = new Team([main, ...teammates]);

    return new CalcSetup({
      ...this,
      ID,
      main,
      teammates,
      team,
    });
  }

  calculate(shouldRecord?: boolean) {
    const { main, result } = calculateSetup(this, { shouldRecord: true });

    const newMain = this.updateMain({
      totalAttrs: main.totalAttrs.clone(),
      attkBonusCtrl: main.attkBonusCtrl.clone(),
    });

    return new CalcSetup({
      ...this,
      main: newMain,
      result,
    });
  }

  // ===== MAIN CHARACTER =====

  updateMain(data: MainUpdateData) {
    return new CalcCharacter(
      {
        ...this.main,
        ...data,
      },
      this.main.data,
      this.team
    );
  }

  cloneMain() {
    const { weapon, atfGear, attkBonusCtrl, totalAttrs } = this.main;

    return new CalcCharacter(
      {
        ...this.main,
        weapon: new Weapon(weapon, weapon.data),
        atfGear: new ArtifactGear(atfGear.pieces),
        attkBonusCtrl: attkBonusCtrl.clone(),
        totalAttrs: totalAttrs.clone(),
      },
      this.main.data,
      this.team
    );
  }

  // ===== WEAPON =====

  updateMainWeapon(info: Partial<IWeapon>) {
    const { weapon } = this.main;
    const data = info.code && info.code !== weapon.code ? $AppWeapon.get(info.code)! : weapon.data;

    return new Weapon({ ...weapon, ...info }, data);
  }

  // ===== ARTIFACTS =====

  setArtifactPiece(
    artifact: CreateArtifactParams,
    data: AppArtifact = $AppArtifact.getSet(artifact.code)!,
    shouldKeepStats = false
  ) {
    const { atfGear } = this.main;
    const oldPiece = atfGear.pieces[artifact.type];
    let newPiece: IArtifactBasic;

    if (shouldKeepStats && oldPiece) {
      newPiece = createArtifactBasic({
        ...oldPiece,
        code: artifact.code,
        rarity: artifact.rarity,
        ID: Date.now(),
      });
    } else {
      newPiece = createArtifactBasic({
        ...artifact,
        ID: Date.now(),
      });
    }

    atfGear.pieces[artifact.type] = new Artifact(newPiece, data);

    return new ArtifactGear(atfGear.pieces);
  }

  removeArtifactPiece(type: ArtifactType) {
    const { pieces } = this.main.atfGear;
    pieces[type] = undefined;

    return new ArtifactGear(pieces);
  }

  updateArtifactPiece(type: ArtifactType, info: ArtifactPieceUpdateData) {
    const { pieces } = this.main.atfGear;
    const piece = pieces[type];

    if (!piece) {
      return this.main.atfGear;
    }

    const newSubStats = [...piece.subStats];
    const { subStat, ...newInfo } = info;

    if (subStat) {
      const { index, ...newSubStat } = subStat;

      newSubStats[index] = {
        ...newSubStats[index],
        ...newSubStat,
      };
    }

    pieces[type] = new Artifact({ ...piece, ...newInfo, subStats: newSubStats }, piece.data);

    return new ArtifactGear(pieces);
  }

  /** Used when change involves artifact.sets */
  setArtifactGear(newAtfGear: ArtifactGear) {
    this.main.atfGear = newAtfGear;
    this.artBuffCtrls = newAtfGear.sets
      .map((set) => createArtifactBuffCtrls(set.data, true, set.bonusLv))
      .flat();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
  }

  cloneArtifactGear() {
    const pieces = this.main.atfGear.pieces.map<Artifact>((piece) => {
      return new Artifact(piece.serialize(), piece.data);
    });

    return new ArtifactGear(pieces);
  }

  // ===== MODIFIERS UPDATE FOLLOW-UPS =====

  /** Run after team update */
  updateRsnModCtrls() {
    const rsnModCtrls = createRsnModCtrls(this.team);

    this.rsnBuffCtrls = Array_.sync(this.rsnBuffCtrls, rsnModCtrls.buffCtrls, "element");
    this.rsnDebuffCtrls = Array_.sync(this.rsnDebuffCtrls, rsnModCtrls.debuffCtrls, "element");
  }

  updateTeamBuffCtrls() {
    const teamBuffCtrls = createTeamBuffCtrls(this);
    this.teamBuffCtrls = Array_.sync(this.teamBuffCtrls, teamBuffCtrls, (ctrl) => ctrl.data.index);
  }

  updateArtifactDebuffCtrls() {
    const artDebuffCtrls = createArtifactDebuffCtrls(this.main.atfGear.sets, this.teammates);
    this.artDebuffCtrls = Array_.sync(this.artDebuffCtrls, artDebuffCtrls, (ctrl) => ctrl.code);
  }

  // ===== TEAMMATES =====

  setTeammate(
    info: CalcTeammateConstructInfo,
    index: number,
    data: AppCharacter = $AppCharacter.get(info.name)
  ) {
    const newTeam = new Team();
    const newTeammates = [...this.teammates];

    newTeammates[index] = new CalcTeammate(info, data, newTeam);
    newTeam.updateMembers([this.main, ...newTeammates]);

    this.team = newTeam;
    this.teammates = newTeammates;
    this.updateRsnModCtrls();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
  }

  removeTeammate(teammate: CalcTeammate) {
    const newTeammates = this.teammates.filter((tm) => tm.name !== teammate.name);

    this.team = new Team([this.main, ...newTeammates]);
    this.teammates = newTeammates;
    this.updateRsnModCtrls();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
  }

  updateTeammate(
    tmCode: number,
    data: TeammateUpdateData | ((teammate: CalcTeammate) => TeammateUpdateData)
  ) {
    this.teammates = this.teammates.map((teammate) => {
      if (teammate.data.code === tmCode) {
        const updateData = typeof data === "function" ? data(teammate) : data;

        return teammate.update({ ...updateData });
      }

      return teammate;
    });

    this.updateArtifactDebuffCtrls();
  }
}

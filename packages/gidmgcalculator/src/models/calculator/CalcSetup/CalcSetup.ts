import type { CalcResult } from "@/calculation-new/calculator/types";
import type {
  AppCharacter,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IArtifactBuffCtrl,
  IArtifactDebuffCtrl,
  IArtifactModCtrlBasic,
  IModifierCtrlBasic,
  ITeamBuffCtrl,
  ITeammate,
  IWeaponBuffCtrl,
  ResonanceModCtrl,
  TotalAttributes,
} from "@/types";
import type { MainCharacter } from "../MainCharacter";
import type { MainTarget } from "../MainTarget";
import type { CalcSetupConstructParams, CloneOptions, ICalcSetup } from "./types";

import { calculateSetup } from "@/calculation-new/calculator";
import { $AppCharacter } from "@/services";
import Array_ from "@/utils/Array";
import TypeCounter from "@/utils/TypeCounter";
import { CalcTeam } from "../CalcTeam";
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
import { isAutoRsnElmt } from "@/models/base/utils/isAutoRsnElmt";
import { MainArtifactGear } from "../MainArtifactGear";

type TeammateUpdateData = Partial<
  Pick<ITeammate, "weapon" | "artifact" | "buffCtrls" | "debuffCtrls">
>;

export class CalcSetup implements ICalcSetup<MainCharacter, CalcTeammate, CalcTeam> {
  ID: number;
  char: MainCharacter;
  selfBuffCtrls: IAbilityBuffCtrl[];
  selfDebuffCtrls: IAbilityDebuffCtrl[];
  wpBuffCtrls: IWeaponBuffCtrl[];
  artBuffCtrls: IArtifactBuffCtrl[];
  artDebuffCtrls: IArtifactDebuffCtrl[];
  teamBuffCtrls: ITeamBuffCtrl[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];
  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];

  teammates: CalcTeammate[];
  team: CalcTeam;
  target: MainTarget;
  artifactAttrs: TotalAttributes;
  result: CalcResult;

  constructor(setup: CalcSetupConstructParams) {
    const { char } = setup;
    const {
      ID = Date.now(),
      selfBuffCtrls = createAbilityBuffCtrls(char.data, true),
      selfDebuffCtrls = createAbilityDebuffCtrls(char.data, true),
      wpBuffCtrls = createWeaponBuffCtrls(char.weapon.data, true),
      teammates = [],
      artBuffCtrls = createMainArtifactBuffCtrls(char.artifact.sets),
      artDebuffCtrls = createArtifactDebuffCtrls(char.artifact.sets, teammates),
      team = new CalcTeam(char, teammates),
      elmtEvent = createElementalEvent(),
      customBuffCtrls = [],
      customDebuffCtrls = [],
      result = {
        NAs: {},
        ES: {},
        EB: {},
        RXN: {},
        WP: {},
      },
    } = setup;
    const defaultRsnModCtrls = createRsnModCtrls(team);
    const {
      rsnBuffCtrls = defaultRsnModCtrls.buffCtrls,
      rsnDebuffCtrls = defaultRsnModCtrls.debuffCtrls,
    } = setup;

    this.ID = ID;
    this.char = setup.char;
    this.selfBuffCtrls = selfBuffCtrls;
    this.selfDebuffCtrls = selfDebuffCtrls;
    this.wpBuffCtrls = wpBuffCtrls;
    this.artBuffCtrls = artBuffCtrls;
    this.artDebuffCtrls = artDebuffCtrls;
    this.rsnBuffCtrls = rsnBuffCtrls;
    this.rsnDebuffCtrls = rsnDebuffCtrls;
    this.elmtEvent = elmtEvent;
    this.customBuffCtrls = customBuffCtrls;
    this.customDebuffCtrls = customDebuffCtrls;
    this.teammates = teammates;
    this.team = team;
    this.target = setup.target;
    this.teamBuffCtrls = createTeamBuffCtrls(this);

    this.artifactAttrs = new TypeCounter(setup.artifactAttrs?.result);
    this.result = result;
  }

  clone(options: CloneOptions = {}) {
    const { ID = this.ID } = options;
    const char = this.char.clone();
    const teammates = this.teammates.map((teammate) => teammate.clone());
    const team = new CalcTeam(char, teammates);

    return new CalcSetup({
      ...this,
      ID,
      char,
      teammates,
      team,
    });
  }

  // update(data: UpdateData) {
  //   return new CalcSetup({
  //     ...this,
  //     ...data,
  //   });
  // }

  calculate(shouldRecord?: boolean) {
    const { main, result, target } = calculateSetup(this, { shouldRecord: true });

    console.log("============");
    console.log("setup", this);

    const character = this.char.update({
      totalAttrs: main.totalAttrs.clone(),
      attkBonusCtrl: main.attkBonusCtrl.clone(),
    });

    console.log("character", character);
    console.log("target", target);

    return new CalcSetup({
      ...this,
      char: character,
      artifactAttrs: main.finalizeArtifactAttrs(),
      result,
    });
  }

  // ===== MODIFIERS UPDATE FOLLOW-UPS =====

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
    const artDebuffCtrls = createArtifactDebuffCtrls(this.char.artifact.sets, this.teammates);
    this.artDebuffCtrls = Array_.sync(this.artDebuffCtrls, artDebuffCtrls, (ctrl) => ctrl.code);
  }

  // ===== TEAMMATES =====

  setTeammate(
    info: CalcTeammateConstructInfo,
    index: number,
    data: AppCharacter = $AppCharacter.get(info.name)
  ) {
    const newTeam = new CalcTeam(this.char);
    const newTeammates = [...this.teammates];

    newTeammates[index] = new CalcTeammate(info, data, newTeam);
    newTeam.updateTeammates(newTeammates);

    this.team = newTeam;
    this.teammates = newTeammates;
    this.updateRsnModCtrls();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
  }

  removeTeammate(teammate: CalcTeammate) {
    const removedElmt = teammate.data.vision;
    const newTeammates = this.teammates.filter((tm) => tm.name !== teammate.name);
    const newTeam = new CalcTeam(this.char, newTeammates);

    if (isAutoRsnElmt(removedElmt) && !newTeam.resonances.includes(removedElmt)) {
      this.rsnBuffCtrls = this.rsnBuffCtrls.filter((ctrl) => ctrl.element !== removedElmt);
    }

    this.team = newTeam;
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

  // ===== ARTIFACTS =====

  /** Used when change involves artifact.sets */
  updateMainArtifact(newArtifact: MainArtifactGear) {
    this.char.artifact = newArtifact;
    this.artBuffCtrls = newArtifact.sets
      .map((set) => createArtifactBuffCtrls(set.data, true, set.bonusLv))
      .flat();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
  }
}

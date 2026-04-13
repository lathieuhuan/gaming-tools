import { Array_ } from "ron-utils";

import type { AppCharacter, ITeammateInfo, TalentCalcItem, TeamMember } from "@/types";
import type { PartiallyRequiredOnly } from "rond";

import { calculateSetup } from "@/calculation/calculator";
import { createTarget, createTeammate } from "@/logic/entity.logic";
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
} from "@/logic/modifier.logic";
import { ArtifactGear } from "../ArtifactGear";
import { Character } from "../Character";
import { Team } from "../Team";
import { Teammate, type TeammateConstructOptions } from "../Teammate";
import { CalcSetupBase, type CalcSetupBaseConstructInfo } from "./CalcSetupBase";

type TeammateUpdateData = Partial<
  Pick<ITeammateInfo, "weapon" | "artifact" | "buffCtrls" | "debuffCtrls" | "enhanced">
>;

type CloneOptions = {
  ID?: number;
};

export type CalcSetupConstructInfo = PartiallyRequiredOnly<CalcSetupBaseConstructInfo, "main">;

export class CalcSetup extends CalcSetupBase {
  //
  calcItems: TalentCalcItem[] = [];

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
      team = new Team(),
      elmtEvent = createElementalEvent(),
      customBuffCtrls = [],
      customDebuffCtrls = [],
      target = createTarget({ code: 0 }),
      result = {
        NAs: {},
        ES: {},
        EB: {},
        XTRA: {},
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

    this.team.updateMembers([main, ...teammates]);
    this.teamBuffCtrls = info.teamBuffCtrls || createTeamBuffCtrls(this);
    this.updateCalcItems();
  }

  clone(options: CloneOptions = {}) {
    const { ID = this.ID } = options;
    const main = this.main.deepClone();
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

  calculate(shouldLog?: boolean) {
    this.updateCalcItems();

    const { main, result } = calculateSetup(this, { shouldLog });

    const newMain = main.clone({
      allAttrsCtrl: main.allAttrsCtrl.clone(),
      attkBonusCtrl: main.attkBonusCtrl.clone(),
    });

    return new CalcSetup({
      ...this,
      main: newMain,
      result,
    });
  }

  // ===== ARTIFACTS =====

  /** Used when change involves artifact.sets */
  setArtifactGear(newAtfGear: ArtifactGear) {
    this.main.atfGear = newAtfGear;
    this.artBuffCtrls = newAtfGear.sets
      .map((set) => createArtifactBuffCtrls(set.data, true, set.bonusLv))
      .flat();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
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

  private parseNicoleState(nicole: TeamMember): { cons: number; EB: number } {
    let EB = 0;
    let cons = 0;

    if (nicole instanceof Teammate) {
      EB = nicole.buffCtrls.find((ctrl) => ctrl.id === 2)?.inputs?.at(0) || 0;
      cons = nicole.buffCtrls.find((ctrl) => ctrl.id === 1)?.inputs?.at(3) || 0;
    } else if (nicole instanceof Character) {
      EB = nicole.state.EB;
      cons = nicole.state.cons;
    }

    return { cons, EB };
  }

  private getNicoleEBFactor(EB: number): number | null {
    let factor = 100 + EB * 10;

    if (EB > 10) {
      factor += (EB - 10) * 2;
    }

    return factor;
  }

  updateCalcItems() {
    this.calcItems = [];

    const nicole = this.team.getMember("Nicole");

    if (!nicole) {
      return;
    }

    const { EB } = this.parseNicoleState(nicole);
    const ebFactor = EB ? this.getNicoleEBFactor(EB) : null;
    const attElmt = this.main.data.vision;
    // const isWitchRite = this.team.witchRiteLv >= 2;

    if (ebFactor) {
      this.calcItems.push({
        name: "Arcane Projection (Nicole EB)",
        factor: ebFactor,
        attElmt: this.main.data.vision,
        noU: true,
      });
    }

    this.calcItems.push({
      name: "Arcane Projection: Unity (Nicole C1)",
      factor: 600,
      attElmt,
      noU: true,
    });
  }

  // ===== TEAMMATES =====

  setTeammate(
    info: TeammateConstructOptions & { code: number },
    index: number,
    data?: AppCharacter
  ) {
    const newTeam = new Team();
    const newTeammates = [...this.teammates];

    newTeammates[index] = createTeammate(info, data, { team: newTeam });
    newTeam.updateMembers([this.main, ...newTeammates]);

    this.team = newTeam;
    this.teammates = newTeammates;
    this.updateRsnModCtrls();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
  }

  removeTeammate(teammate: Teammate) {
    const newTeammates = this.teammates.filter((tm) => tm.code !== teammate.code);

    this.team = new Team([this.main, ...newTeammates]);
    this.teammates = newTeammates;
    this.updateRsnModCtrls();
    this.updateTeamBuffCtrls();
    this.updateArtifactDebuffCtrls();
  }

  updateTeammate(
    tmCode: number,
    data: TeammateUpdateData | ((teammate: Teammate) => TeammateUpdateData)
  ) {
    this.teammates = this.teammates.map((teammate) => {
      if (teammate.data.code === tmCode) {
        const updateData = typeof data === "function" ? data(teammate) : data;
        return teammate.update({ ...updateData });
      }

      return teammate;
    });

    this.team.updateMembers([this.main, ...this.teammates]);
    this.updateArtifactDebuffCtrls();
  }
}

import type { Character } from "@/models";

import { createTarget } from "@/logic/entity.logic";
import {
  createAbilityBuffCtrls,
  createAbilityDebuffCtrls,
  createArtifactDebuffCtrls,
  createElementalEvent,
  createMainArtifactBuffCtrls,
  createRsnModCtrls,
  createWeaponBuffCtrls,
} from "@/logic/modifier.logic";

import { Team } from "../Team";
import { calculateSetup, CalculateSetupOptions } from "../calculateSetup";
import { createTeamBuffCtrls } from "../createTeamBuffCtrls";
import { CalcSetupCore } from "./CalcSetupCore";

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

export class CalcSetup extends CalcSetupCore {
  //
  calculate(options?: CalculateSetupOptions) {
    return calculateSetup(this, options);
  }

  clone(options: { ID?: number } = {}) {
    const { ID = this.ID } = options;

    return new CalcSetup(
      ID,
      this.main,
      this.teammates,
      this.team,
      this.target,
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

  deepClone(ID: number) {
    const main = this.main.deepClone();
    const teammates = this.teammates.map((teammate) => teammate.deepClone());
    const team = new Team([main, ...teammates]);

    return new CalcSetup(
      ID,
      main,
      teammates,
      team,
      this.target.clone(),
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
}

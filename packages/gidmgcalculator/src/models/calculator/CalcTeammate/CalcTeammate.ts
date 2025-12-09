import type {
  AppCharacter,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  ITeam,
  ITeammate,
  ITeammateInfo,
  IWeaponBuffCtrl,
} from "@/types";
import type { PartiallyRequiredOnly } from "rond";

import { Teammate, Weapon } from "@/models/base";
import { parseAbilityDesc } from "@/models/base/utils/parseAbilityDesc";
import { $AppWeapon } from "@/services";
import Object_ from "@/utils/Object";
import { createAbilityBuffCtrls, createAbilityDebuffCtrls } from "../modifier";
import { BonusCalc } from "./BonusCalc";
import { PenaltyCalc } from "./PenaltyCalc";

export type CalcTeammateConstructInfo = PartiallyRequiredOnly<ITeammateInfo, "name">;

type CloneOptions = {
  team?: ITeam;
};

export class CalcTeammate extends Teammate {
  constructor(info: CalcTeammateConstructInfo, public data: AppCharacter, team: ITeam) {
    const {
      enhanced = false,
      buffCtrls = createAbilityBuffCtrls(data, false),
      debuffCtrls = createAbilityDebuffCtrls(data, false),
    } = info;

    let weapon = info.weapon;

    if (!weapon) {
      const { weaponType } = data;
      const code = Weapon.DEFAULT_CODE[weaponType];

      weapon = {
        code,
        type: weaponType,
        refi: 1,
        buffCtrls: [],
        data: $AppWeapon.get(code)!,
      };
    }

    super({ ...info, enhanced, buffCtrls, debuffCtrls, weapon }, data, team);
  }

  update(data: Partial<ITeammate>) {
    return new CalcTeammate({ ...this, ...data }, this.data, this.team);
  }

  updateWeaponBuffCtrl(newCtrl: IWeaponBuffCtrl) {
    return this.weapon.buffCtrls.map((ctrl) => (ctrl.id === newCtrl.id ? newCtrl : ctrl));
  }

  clone(options: CloneOptions = {}) {
    const { team = this.team } = options;

    const teamamte: ITeammate = {
      ...this,
      buffCtrls: Object_.clone(this.buffCtrls),
      debuffCtrls: Object_.clone(this.debuffCtrls),
      weapon: Object_.clone(this.weapon),
      artifact: Object_.clone(this.artifact),
    };

    return new CalcTeammate(teamamte, this.data, team);
  }

  parseBuffDesc(ctrl: IAbilityBuffCtrl) {
    const { inputs, data } = ctrl;
    const calc = new BonusCalc(this, this.team, { inputs });

    return parseAbilityDesc(data.description, data.effects, calc);
  }

  parseDebuffDesc(ctrl: IAbilityDebuffCtrl) {
    const { inputs, data } = ctrl;
    const calc = new PenaltyCalc(this, this.team, inputs);

    return parseAbilityDesc(data.description, data.effects, calc);
  }
}

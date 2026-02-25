import type {
  AppCharacter,
  BareBonus,
  BonusPerformTools,
  EntityBonusEffect,
  EntityPenaltyEffect,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  ITeam,
  ITeammate,
  ITeammateInfo,
  IWeaponBuffCtrl,
} from "@/types";
import type { PartiallyRequiredOnly } from "rond";

import { createAbilityBuffCtrls, createAbilityDebuffCtrls } from "@/logic/modifier.logic";
import { $AppWeapon } from "@/services";
import Object_ from "@/utils/Object";
import { Teammate } from "../Teammate";
import { Weapon } from "../Weapon";
import { BonusCalc } from "./BonusCalc";
import { PenaltyCalc } from "./PenaltyCalc";

export type TeammateCalcConstructInfo = PartiallyRequiredOnly<ITeammateInfo, "code">;

type CloneOptions = {
  team?: ITeam;
};

export class TeammateCalc extends Teammate {
  constructor(info: TeammateCalcConstructInfo, public data: AppCharacter, public team: ITeam) {
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
    return new TeammateCalc({ ...this, ...data }, this.data, this.team);
  }

  updateWeaponBuffCtrl(newCtrl: IWeaponBuffCtrl) {
    return this.weapon.buffCtrls.map((ctrl) => (ctrl.id === newCtrl.id ? newCtrl : ctrl));
  }

  performBonus(
    config: EntityBonusEffect,
    { inputs = [], refi = 0, basedOnFixed = false }: Partial<BonusPerformTools>
  ): BareBonus {
    return new BonusCalc(this, this.team, { inputs, refi, basedOnFixed }).makeBonus(config);
  }

  performPenalty(config: EntityPenaltyEffect, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).makePenalty(config);
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

    return new TeammateCalc(teamamte, this.data, team);
  }

  parseBuffDesc(ctrl: IAbilityBuffCtrl) {
    return new BonusCalc(this, this.team, { inputs: ctrl.inputs }).parseAbilityDesc(ctrl.data);
  }

  parseDebuffDesc(ctrl: IAbilityDebuffCtrl) {
    return new PenaltyCalc(this, this.team, ctrl.inputs).parseAbilityDesc(ctrl.data);
  }
}

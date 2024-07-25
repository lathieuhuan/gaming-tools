import { AppliedAttackBonus, AppliedAttributeBonus } from "@Backend";
import { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";

export class CoreBonusesControl {
  attrBonus: SimulationAttributeBonus[] = [];
  attkBonus: SimulationAttackBonus[] = [];

  static processAttributeBonus = (bonus: AppliedAttributeBonus): SimulationAttributeBonus => {
    return {
      type: "ATTRIBUTE",
      ...bonus,
    };
  };

  static processAttackBonus = (bonus: AppliedAttackBonus): SimulationAttackBonus => {
    return {
      type: "ATTACK",
      ...bonus,
    };
  };

  updateAttrBonuses = (bonus: AppliedAttributeBonus) => {
    const existedIndex = this.attrBonus.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this.attrBonus.push(CoreBonusesControl.processAttributeBonus(bonus));
    } else {
      this.attrBonus[existedIndex] = Object.assign(this.attrBonus[existedIndex], bonus);
    }
  };

  updateAttkBonuses = (bonus: AppliedAttackBonus) => {
    const existedIndex = this.attkBonus.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this.attkBonus.push(CoreBonusesControl.processAttackBonus(bonus));
    } else {
      this.attkBonus[existedIndex] = Object.assign(this.attkBonus[existedIndex], bonus);
    }
  };
}

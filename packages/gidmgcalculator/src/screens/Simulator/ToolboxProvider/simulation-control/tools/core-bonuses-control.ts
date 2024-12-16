import type { AppliedAttackBonus, AppliedAttributeBonus } from "@Backend";
import type { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";

export class CoreBonusesControl {
  private _attr: SimulationAttributeBonus[] = [];
  private _attk: SimulationAttackBonus[] = [];

  get attrBonus() {
    return this._attr;
  }

  get attkBonus() {
    return this._attk;
  }

  updateAttrBonuses = (bonus: AppliedAttributeBonus) => {
    const existedIndex = this._attr.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this._attr.push(bonus);
    } else {
      Object.assign(this._attr[existedIndex], bonus);
    }
  };

  updateAttkBonuses = (bonus: AppliedAttackBonus) => {
    const existedIndex = this._attk.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this._attk.push(bonus);
    } else {
      Object.assign(this._attk[existedIndex], bonus);
    }
  };

  reset = (attrBonuses: SimulationAttributeBonus[] = [], attkBonuses: SimulationAttackBonus[] = []) => {
    this._attr = attrBonuses;
    this._attk = attkBonuses;
  };
}

import type { DeepReadonly } from "rond";
import type { AppliedAttackBonus, AppliedAttributeBonus, AppliedBonuses } from "@Backend";
import type { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";

export class CoreBonusesControl {
  private _attr: SimulationAttributeBonus[] = [];
  private _attk: SimulationAttackBonus[] = [];

  get attrBonuses(): DeepReadonly<SimulationAttributeBonus[]> {
    return this._attr;
  }

  get attkBonuses(): DeepReadonly<SimulationAttackBonus[]> {
    return this._attk;
  }

  private addOrUpdateAttrBonus(bonus: AppliedAttributeBonus) {
    const existedIndex = this._attr.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this._attr.push(bonus);
    } else {
      Object.assign(this._attr[existedIndex], bonus);
    }
  }

  updateAttrBonuses = (bonuses: AppliedAttributeBonus | AppliedAttributeBonus[]) => {
    Array.isArray(bonuses)
      ? bonuses.forEach((bonus) => this.addOrUpdateAttrBonus(bonus))
      : this.addOrUpdateAttrBonus(bonuses);
  };

  private addOrUpdateAttkBonus(bonus: AppliedAttackBonus) {
    const existedIndex = this._attk.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this._attk.push(bonus);
    } else {
      Object.assign(this._attk[existedIndex], bonus);
    }
  }

  updateAttkBonuses = (bonuses: AppliedAttackBonus | AppliedAttackBonus[]) => {
    Array.isArray(bonuses)
      ? bonuses.forEach((bonus) => this.addOrUpdateAttkBonus(bonus))
      : this.addOrUpdateAttkBonus(bonuses);
  };

  updateBonuses(applied: AppliedBonuses) {
    this.updateAttrBonuses(applied.attrBonuses);
    this.updateAttkBonuses(applied.attkBonuses);
  }

  reset = (attrBonuses: SimulationAttributeBonus[] = [], attkBonuses: SimulationAttackBonus[] = []) => {
    this._attr = attrBonuses;
    this._attk = attkBonuses;
  };
}

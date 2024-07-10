import type { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import type { AppliedAttackBonus, AppliedAttributeBonus } from "@Src/backend";

import { BuffApplierCore, CalculationInfo, EntityCalc } from "@Backend";

export class SimulatorBuffApplier extends BuffApplierCore {
  private innateAttrBonus: SimulationAttributeBonus[] = [];
  private innateAttkBonus: SimulationAttackBonus[] = [];
  private _attrBonus: SimulationAttributeBonus[] = [];
  private _attkBonus: SimulationAttackBonus[] = [];

  get attrBonus() {
    return this.innateAttrBonus.concat(this._attrBonus);
  }

  get attkBonus() {
    return this.innateAttkBonus.concat(this._attkBonus);
  }

  constructor(info: CalculationInfo, resonanceBonus: SimulationAttributeBonus[]) {
    super(info);

    const { name, innateBuffs = [] } = info.appChar;

    for (const buff of innateBuffs) {
      if (EntityCalc.isGrantedEffect(buff, info.char)) {
        const description = `Self / ${buff.src}`;

        const bonuses = this.getAppliedCharacterBonuses({
          description,
          buff,
          inputs: [],
          fromSelf: true,
          isFinal: false,
        });

        for (const bonus of bonuses.attrBonuses) {
          this.innateAttrBonus.push(this.processAttributeBonus(bonus));
        }
        for (const bonus of bonuses.attkBonuses) {
          this.innateAttkBonus.push(this.processAttackBonus(bonus));
        }
      }
    }
  }

  private processAttributeBonus = (bonus: AppliedAttributeBonus): SimulationAttributeBonus => {
    return {
      type: "ATTRIBUTE",
      ...bonus,
    };
  };

  private processAttackBonus = (bonus: AppliedAttackBonus): SimulationAttackBonus => {
    return {
      type: "ATTACK",
      ...bonus,
    };
  };

  updateAttrBonus = (bonus: AppliedAttributeBonus) => {
    const existedIndex = this._attrBonus.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this._attrBonus.push(this.processAttributeBonus(bonus));
    } else {
      this._attrBonus[existedIndex] = Object.assign(this._attrBonus[existedIndex], bonus);
    }
  };

  updateAttkBonus = (bonus: AppliedAttackBonus) => {
    const existedIndex = this._attkBonus.findIndex((_bonus) => _bonus.id === bonus.id);

    if (existedIndex === -1) {
      this._attkBonus.push(this.processAttackBonus(bonus));
    } else {
      this._attkBonus[existedIndex] = Object.assign(this._attkBonus[existedIndex], bonus);
    }
  };
}

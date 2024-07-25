import type { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import type { AppliedAttackBonus, AppliedAttributeBonus } from "@Src/backend";

import { BuffApplierCore, CalculationInfo, EntityCalc } from "@Backend";
import { PartyBonusControl } from "./party-bonus-control";
import { CoreBonusesControl } from "./core-bonuses-control";

export class MemberBonusesControl extends BuffApplierCore {
  private innateAttrBonus: SimulationAttributeBonus[] = [];
  private innateAttkBonus: SimulationAttackBonus[] = [];
  private bonusesCtrl = new CoreBonusesControl();
  private isOnfield = false;

  get attrBonus() {
    return this.innateAttrBonus.concat(this.partyBonus.getAttrBonuses(this.isOnfield), this.bonusesCtrl.attrBonus);
  }

  get attkBonus() {
    return this.innateAttkBonus.concat(this.partyBonus.getAttkBonuses(this.isOnfield), this.bonusesCtrl.attkBonus);
  }

  constructor(info: CalculationInfo, private partyBonus: PartyBonusControl) {
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
          this.innateAttrBonus.push(CoreBonusesControl.processAttributeBonus(bonus));
        }
        for (const bonus of bonuses.attkBonuses) {
          this.innateAttkBonus.push(CoreBonusesControl.processAttackBonus(bonus));
        }
      }
    }
  }

  switch = (dir: "in" | "out") => {
    this.isOnfield = dir === "out";
  };

  updateAttrBonus = (bonus: AppliedAttributeBonus) => {
    this.bonusesCtrl.updateAttrBonuses(bonus);
  };

  updateAttkBonus = (bonus: AppliedAttackBonus) => {
    this.bonusesCtrl.updateAttkBonuses(bonus);
  };
}

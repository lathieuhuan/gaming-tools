import type { CalculationInfo, AppliedAttackBonus, AppliedAttributeBonus, TotalAttributeControl } from "@Backend";
import type { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import type { PartyBonusControl } from "./party-bonus-control";

import { BuffApplierCore, EntityCalc } from "@Backend";
import { CoreBonusesControl } from "./core-bonuses-control";

export class MemberBonusesControl extends BuffApplierCore {
  private innateAttrBonus: SimulationAttributeBonus[] = [];
  private innateAttkBonus: SimulationAttackBonus[] = [];
  private bonusesCtrl = new CoreBonusesControl();

  isOnfield = false;

  get totalAttr() {
    return this.totalAttrCtrl.finalize();
  }

  get attrBonus() {
    return this.innateAttrBonus.concat(this.partyBonus.getAttrBonuses(this.isOnfield), this.bonusesCtrl.attrBonus);
  }

  get attkBonus() {
    return this.innateAttkBonus.concat(this.partyBonus.getAttkBonuses(this.isOnfield), this.bonusesCtrl.attkBonus);
  }

  constructor(
    info: CalculationInfo,
    private rootTotalAttr: TotalAttributeControl,
    private partyBonus: PartyBonusControl
  ) {
    super(info, rootTotalAttr.clone());

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
    this.isOnfield = dir === "in";
  };

  resetBonuses = () => {
    this.bonusesCtrl.attrBonus = [];
    this.bonusesCtrl.attkBonus = [];
  }

  applyBonuses = () => {
    this.totalAttrCtrl = this.rootTotalAttr.clone();

    for (const bonus of this.attrBonus) {
      const add = bonus.isStable ? this.totalAttrCtrl.addStable : this.totalAttrCtrl.addUnstable;
      add(bonus.toStat, bonus.value, bonus.description);
    }
  };

  updateAttrBonus = (bonus: AppliedAttributeBonus) => {
    this.bonusesCtrl.updateAttrBonuses(bonus);
  };

  updateAttkBonus = (bonus: AppliedAttackBonus) => {
    this.bonusesCtrl.updateAttkBonuses(bonus);
  };
}

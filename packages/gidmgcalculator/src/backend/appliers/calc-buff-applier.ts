import type { CalculationInfo } from "../utils";
import type {
  AppliedBonuses,
  ApplyArtifactBuffArgs,
  ApplyCharacterBuffArgs,
  ApplyWeaponBuffArgs,
} from "./appliers.types";

import { AttackBonusControl, TotalAttributeControl } from "../controls";
import { BuffApplierCore } from "./buff-applier-core";

export class CalcBuffApplier extends BuffApplierCore {
  constructor(info: CalculationInfo, totalAttrCtrl: TotalAttributeControl, private attackBonus: AttackBonusControl) {
    super(info, totalAttrCtrl);
  }

  private applyBonuses = (bonuses: AppliedBonuses) => {
    for (const bonus of bonuses.attrBonuses) {
      const add = bonus.isStable ? this.totalAttrCtrl.addStable : this.totalAttrCtrl.addUnstable;
      add(bonus.toStat, bonus.value, bonus.description);
    }
    for (const bonus of bonuses.attkBonuses) {
      this.attackBonus.add(bonus.toType, bonus.toKey, bonus.value, bonus.description);
    }
  };

  applyCharacterBuff = (args: ApplyCharacterBuffArgs) => {
    const bonuses = this.getAppliedCharacterBonuses(args);
    this.applyBonuses(bonuses);
  };

  applyWeaponBuff = (args: ApplyWeaponBuffArgs) => {
    const bonuses = this.getApplyWeaponBonuses(args);
    this.applyBonuses(bonuses);
  };

  applyArtifactBuff = (args: ApplyArtifactBuffArgs) => {
    const bonuses = this.getApplyArtifactBonuses(args);
    this.applyBonuses(bonuses);
  };
}

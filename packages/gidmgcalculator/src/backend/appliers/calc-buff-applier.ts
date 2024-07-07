import type { CalculationInfo } from "@Src/backend/utils";
import type {
  ApplyArtifactBuffArgs,
  ApplyBuffArgs,
  ApplyCharacterBuffArgs,
  ApplyWeaponBuffArgs,
} from "./appliers.types";

import { AttackBonusControl, TotalAttributeControl } from "@Src/backend/controls";
import { BuffApplierCore } from "./buff-applier-core";

type InternalApplyBuffArgs<T extends ApplyBuffArgs<any>> = Omit<T, "applyAttrBonus" | "applyAttkBonus">;

export class CalcBuffApplier extends BuffApplierCore {
  private appliers: Pick<ApplyBuffArgs<any>, "applyAttrBonus" | "applyAttkBonus">;

  constructor(info: CalculationInfo, totalAttr: TotalAttributeControl, attackBonus: AttackBonusControl) {
    super(info, totalAttr);

    this.appliers = {
      applyAttrBonus: (bonus) => {
        const add = bonus.isStable ? totalAttr.addStable : totalAttr.addUnstable;
        add(bonus.toStat, bonus.value, bonus.description);
      },
      applyAttkBonus: (bonus) => {
        attackBonus.add(bonus.toType, bonus.toKey, bonus.value, bonus.description);
      },
    };
  }

  applyCharacterBuff = (args: InternalApplyBuffArgs<ApplyCharacterBuffArgs>) => {
    this._applyCharacterBuff({
      ...args,
      ...this.appliers,
    });
  };

  applyWeaponBuff = (args: InternalApplyBuffArgs<ApplyWeaponBuffArgs>) => {
    this._applyWeaponBuff({
      ...args,
      ...this.appliers,
    });
  };

  applyArtifactBuff = (args: InternalApplyBuffArgs<ApplyArtifactBuffArgs>) => {
    this._applyArtifactBuff({
      ...args,
      ...this.appliers,
    });
  };
}

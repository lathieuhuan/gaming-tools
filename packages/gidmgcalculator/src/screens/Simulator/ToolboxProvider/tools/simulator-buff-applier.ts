import type { SimulationAttackBonus, SimulationAttributeBonus, SimulationBonusCore } from "@Src/types";
import type {
  AppliedAttackBonus,
  AppliedAttributeBonus,
  ApplyBuffArgs,
  // ApplyArtifactBuffArgs,
  // ApplyCharacterBuffArgs,
  // ApplyWeaponBuffArgs,
} from "@Src/backend/appliers/appliers.types";

import { BuffApplierCore, CalculationInfo, EntityCalc } from "@Backend";

// type InternalApplyBuffArgs<T extends ApplyBuffArgs<any>> = Omit<T, "fromSelf" | "isFinal">;

export type ApplyFn = Pick<ApplyBuffArgs<any>, "applyAttrBonus" | "applyAttkBonus">;

type BuffTrigger = SimulationBonusCore["trigger"];

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

  constructor(info: CalculationInfo) {
    super(info);

    const { name, innateBuffs = [] } = info.appChar;

    for (const buff of innateBuffs) {
      if (EntityCalc.isGrantedEffect(buff, info.char)) {
        const trigger: BuffTrigger = {
          character: name,
          modifier: buff.src,
        };

        this._applyCharacterBuff({
          description: `Self / ${buff.src}`,
          buff,
          inputs: [],
          fromSelf: true,
          isFinal: false,
          applyAttrBonus: (bonus) => {
            this.innateAttrBonus.push(this.processAttributeBonus(bonus, trigger));
          },
          applyAttkBonus: (bonus) => {
            this.innateAttkBonus.push(this.processAttackBonus(bonus, trigger));
          },
        });
      }
    }
  }

  private processAttributeBonus = (bonus: AppliedAttributeBonus, trigger: BuffTrigger): SimulationAttributeBonus => {
    return {
      type: "ATTRIBUTE",
      stable: bonus.stable,
      toStat: bonus.stat,
      value: bonus.value,
      trigger,
    };
  };

  private processAttackBonus = (bonus: AppliedAttackBonus, trigger: BuffTrigger): SimulationAttackBonus => {
    return {
      type: "ATTACK",
      toType: bonus.module,
      toKey: bonus.path,
      value: bonus.value,
      trigger,
    };
  };

  updateAttrBonus = (bonus: AppliedAttributeBonus, trigger: BuffTrigger) => {
    const existedIndex = this._attrBonus.findIndex(
      (_bonus) =>
        _bonus.trigger.character === trigger.character &&
        _bonus.trigger.modifier === trigger.modifier &&
        _bonus.toStat === bonus.stat
    );

    if (existedIndex === -1) {
      this._attrBonus.push(this.processAttributeBonus(bonus, trigger));
    } else {
      this._attrBonus[existedIndex] = {
        ...this._attrBonus[existedIndex],
        value: bonus.value,
      };
    }
  };

  updateAttkBonus = (bonus: AppliedAttackBonus, trigger: BuffTrigger) => {
    const existedIndex = this._attkBonus.findIndex(
      (_bonus) =>
        _bonus.trigger.character === trigger.character &&
        _bonus.trigger.modifier === trigger.modifier &&
        _bonus.toType === bonus.module &&
        _bonus.toKey === bonus.path
    );

    if (existedIndex === -1) {
      this._attkBonus.push(this.processAttackBonus(bonus, trigger));
    } else {
      this._attkBonus[existedIndex] = {
        ...this._attkBonus[existedIndex],
        value: bonus.value,
      };
    }
  };

  // protected applyCharacterBuff = (args: InternalApplyBuffArgs<ApplyCharacterBuffArgs>) => {
  //   this._applyCharacterBuff({
  //     ...args,
  //     fromSelf: true,
  //   });
  // };

  // protected applyWeaponBuff = (args: InternalApplyBuffArgs<ApplyWeaponBuffArgs>) => {
  //   this._applyWeaponBuff({
  //     ...args,
  //     fromSelf: true,
  //   });
  // };

  // protected applyArtifactBuff = (args: InternalApplyBuffArgs<ApplyArtifactBuffArgs>) => {
  //   this._applyArtifactBuff({
  //     ...args,
  //     fromSelf: true,
  //   });
  // };
}

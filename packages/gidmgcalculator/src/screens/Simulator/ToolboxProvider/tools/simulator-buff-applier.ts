import type { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import type {
  AppliedAttackBonus,
  AppliedAttributeBonus,
  ApplyArtifactBuffArgs,
  ApplyBuffArgs,
  ApplyCharacterBuffArgs,
  ApplyWeaponBuffArgs,
} from "@Src/backend/appliers/appliers.types";

import { BuffApplierCore } from "@Backend";

type InternalApplyBuffArgs<T extends ApplyBuffArgs<any>> = Omit<T, "fromSelf" | "isFinal">;

export type ApplyFn = Pick<ApplyBuffArgs<any>, "applyAttrBonus" | "applyAttkBonus">;

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

  updateAttrBonus = (bonus: AppliedAttributeBonus, trigger: SimulationAttributeBonus["trigger"]) => {
    const existedIndex = this._attrBonus.findIndex(
      (_bonus) =>
        _bonus.trigger.character === trigger.character &&
        _bonus.trigger.modifier === trigger.modifier &&
        _bonus.toStat === bonus.stat
    );

    if (existedIndex === -1) {
      this._attrBonus.push({
        type: "ATTRIBUTE",
        stable: bonus.stable,
        toStat: bonus.stat,
        value: bonus.value,
        trigger,
      });
    } else {
      this._attrBonus[existedIndex] = {
        ...this._attrBonus[existedIndex],
        value: bonus.value,
      };
    }
  };

  updateAttkBonus = (bonus: AppliedAttackBonus, trigger: SimulationAttributeBonus["trigger"]) => {
    const existedIndex = this._attkBonus.findIndex(
      (_bonus) =>
        _bonus.trigger.character === trigger.character &&
        _bonus.trigger.modifier === trigger.modifier &&
        _bonus.toType === bonus.module &&
        _bonus.toKey === bonus.path
    );

    if (existedIndex === -1) {
      this._attkBonus.push({
        type: "ATTACK",
        toType: bonus.module,
        toKey: bonus.path,
        value: bonus.value,
        trigger,
      });
    } else {
      this._attkBonus[existedIndex] = {
        ...this._attkBonus[existedIndex],
        value: bonus.value,
      };
    }
  };

  protected applyCharacterBuff = (args: InternalApplyBuffArgs<ApplyCharacterBuffArgs>) => {
    this._applyCharacterBuff({
      ...args,
      fromSelf: true,
    });
  };

  protected applyWeaponBuff = (args: InternalApplyBuffArgs<ApplyWeaponBuffArgs>) => {
    this._applyWeaponBuff({
      ...args,
      fromSelf: true,
    });
  };

  protected applyArtifactBuff = (args: InternalApplyBuffArgs<ApplyArtifactBuffArgs>) => {
    this._applyArtifactBuff({
      ...args,
      fromSelf: true,
    });
  };
}

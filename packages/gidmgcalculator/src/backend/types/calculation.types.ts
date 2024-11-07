import type { AttackBonusKey, AttackBonusType, AttributeStat } from "./common.types";

/** Actually does not contain "hp_" | "atk_" | "def_" */
type TotalAttributeStat = AttributeStat | "hp_base" | "atk_base" | "def_base";

/** Actually does not contain "hp_" | "atk_" | "def_" */
export type TotalAttribute = Record<TotalAttributeStat, number>;

export type BareBonus = {
  id: string;
  value: number;
  isStable: boolean;
};

export type AppliedAttributeBonus = BareBonus & {
  toStat: AttributeStat;
  description: string;
};

export type AppliedAttackBonus = Pick<BareBonus, "id" | "value"> & {
  toType: AttackBonusType;
  toKey: AttackBonusKey;
  description: string;
};

export type AppliedBonuses = {
  attrBonuses: AppliedAttributeBonus[];
  attkBonuses: AppliedAttackBonus[];
};

import type { AttackBonusKey, AttackBonusType, AttributeStat, BaseAttributeStat } from "../common";

export type BonusPerformTools = {
  inputs: number[];
  refi?: number;
  basedOnStable?: boolean;
};

export type BareBonus = {
  // id?: string;
  value: number;
  isUnstable: boolean;
};

export type AttributeBonus = {
  value: number;
  toStat: AttributeStat | BaseAttributeStat;
  isUnstable?: boolean;
  label: string;
};

export type AttackBonus = {
  value: number;
  toType: AttackBonusType;
  toKey: AttackBonusKey;
  label: string;
};

export type ExclusiveAttackBonus = {
  label: string;
  value: number;
};

export type ExclusiveAttackBonusGroup = {
  type: AttackBonusKey;
  items: ExclusiveAttackBonus[];
};

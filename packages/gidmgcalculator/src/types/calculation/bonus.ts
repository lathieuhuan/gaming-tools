import type {
  AttackBonusKey,
  AttackBonusType,
  AttributeStat,
  BaseAttributeStat,
  LevelableTalentType,
} from "../common";

export type BonusPerformTools = {
  inputs: number[];
  refi?: number;
  basedOnFixed?: boolean;
};

export type BareBonus = {
  // id?: string;
  value: number;
  isDynamic: boolean;
};

export type AttributeBonus = {
  value: number;
  toStat: AttributeStat | BaseAttributeStat;
  isDynamic?: boolean;
  label: string;
};

export type AttackBonus = {
  value: number;
  toType: AttackBonusType;
  toKey: AttackBonusKey;
  label: string;
};

export type TalentLevelBonus = {
  id: string;
  value: number;
  toType: LevelableTalentType;
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

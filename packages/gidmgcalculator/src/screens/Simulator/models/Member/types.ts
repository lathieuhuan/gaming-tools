import type { AttackBonusKey, AttackBonusType, BaseAttributeStat, AttributeStat } from "@/types";

export type BonusGroupId = string;

export type BonusGroupMeta = {
  id: BonusGroupId;
  src: string;
};

export type AttributeBonusStat = AttributeStat | BaseAttributeStat;

export type AttributeBonus = {
  type: "ATTR";
  groupId: BonusGroupId;
  value: number;
  toStat: AttributeBonusStat;
  isDynamic?: boolean;
};

export type AttackBonus = {
  type: "ATTK";
  groupId: BonusGroupId;
  value: number;
  toType: AttackBonusType;
  toKey: AttackBonusKey;
};

export type Bonus = AttributeBonus | AttackBonus;

export type AttributeBonusRecord = Partial<Record<AttributeBonusStat, AttributeBonus[]>>;

export type AttackBonusRecord = Partial<Record<AttackBonusType, AttackBonus[]>>;

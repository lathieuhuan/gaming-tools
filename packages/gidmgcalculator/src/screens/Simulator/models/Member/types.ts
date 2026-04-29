import type {
  AllAttributeStat,
  AttackBonusKey,
  AttackBonusType,
  LevelableTalentType,
} from "@/types";

export type BonusGroupId = string;

export type BonusGroupMeta = {
  id: BonusGroupId;
  src: string;
};

export type TalentLevelBonus = {
  id: string;
  value: number;
  toType: LevelableTalentType;
};

export type AttributeBonus = {
  type: "ATTR";
  groupId: BonusGroupId;
  value: number;
  toStat: AllAttributeStat;
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

export type AttributeBonusRecord = Partial<Record<AllAttributeStat, AttributeBonus[]>>;

export type AttackBonusRecord = Partial<Record<AttackBonusType, AttackBonus[]>>;

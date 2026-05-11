import type {
  AllAttributeStat,
  AttackBonusKey,
  AttackBonusType,
  LevelableTalentType,
  ModAffectType,
} from "@/types";

export type BonusGroupId = string;

export type BonusGroupMeta = {
  id: BonusGroupId;
  src: string;
  affect?: ModAffectType;
  innate?: boolean;
};

export type TalentLevelBonus = {
  type: "TLLV";
  groupId: BonusGroupId;
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

export type Bonus = AttributeBonus | AttackBonus | TalentLevelBonus;

export type BonusGroup = {
  meta: BonusGroupMeta;
  bonuses: Bonus[];
};

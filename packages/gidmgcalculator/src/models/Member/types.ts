import type {
  AllAttributeStat,
  AttackBonusKey,
  AttackBonusType,
  LevelableTalentType,
} from "@/types";

export type TalentLevelBonus = {
  type: "TLLV";
  label: string;
  value: number;
  toType: LevelableTalentType;
};

export type AttributeBonus = {
  type: "ATTR";
  label: string;
  value: number;
  toStat: AllAttributeStat;
  isDynamic?: boolean;
};

export type AttackBonus = {
  type: "ATTK";
  label: string;
  value: number;
  toType: AttackBonusType;
  toKey: AttackBonusKey;
};

export type Bonus = AttributeBonus | AttackBonus | TalentLevelBonus;

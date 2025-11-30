import type { LevelableTalentType } from "@/types";
import type { CalcResultAttackItem, CalcResultOtherItem, CalcResultReactionItem } from "../types";

export type CalcResultTalentItem = CalcResultAttackItem | CalcResultOtherItem;

export type CalcResultWeaponItem = CalcResultAttackItem | CalcResultOtherItem;

export type CalcResultTalentGroup = Record<string, CalcResultTalentItem>;

export type CalcResult = Record<LevelableTalentType, CalcResultTalentGroup> & {
  RXN: Record<string, CalcResultReactionItem>;
  WP: Record<string, CalcResultWeaponItem>;
};

import type { LevelableTalentType } from "@/types";
import type { CalcResultAttackItem, CalcResultOtherItem, CalcResultReactionItem } from "../types";

type CalcResultTalentItem = CalcResultAttackItem | CalcResultOtherItem;

type CalcResultWeaponItem = CalcResultAttackItem | CalcResultOtherItem;

type CalcResultTalentGroup = Record<string, CalcResultTalentItem>;

export type CalcResult = Record<LevelableTalentType, CalcResultTalentGroup> & {
  RXN: Record<string, CalcResultReactionItem>;
  WP: Record<string, CalcResultWeaponItem>;
};

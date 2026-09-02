import type {
  CalcResultAttackItem,
  CalcResultOtherItem,
  CalcResultReactionItem,
} from "@/calculation/types";
import type { LevelableTalentType } from "@/types";

type CalcResultTalentItem = CalcResultAttackItem | CalcResultOtherItem;

type CalcResultWeaponItem = CalcResultAttackItem | CalcResultOtherItem;

type CalcResultTalentGroup = Record<string, CalcResultTalentItem>;

export type CalcResult = {
  [key in LevelableTalentType]: CalcResultTalentGroup;
} & {
  XTRA: Record<string, CalcResultTalentItem>;
  RXN: Record<string, CalcResultReactionItem>;
  WP: Record<string, CalcResultWeaponItem>;
};

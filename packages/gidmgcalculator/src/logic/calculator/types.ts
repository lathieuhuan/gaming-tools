import type { CalcAttackItemOutputs, CalcOtherItemOutputs } from "@/logic/calculation";
import type { LevelableTalentType } from "@/types";

export type CalcResultItem = CalcAttackItemOutputs | CalcOtherItemOutputs;

export type CalcResultGroup = Map<string, CalcResultItem>;

export type CalcResultNew = {
  [key in LevelableTalentType]: CalcResultGroup;
} & {
  XTRA: CalcResultGroup;
  RXN: CalcResultGroup;
  WP: CalcResultGroup;
};

export type CalcResultKey = keyof CalcResultNew;

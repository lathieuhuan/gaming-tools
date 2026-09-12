import type {
  CalcAttackItemOutputs,
  CalcOtherItemOutputs,
  CalcReactionOutputs,
} from "@/logic/calculation";
import type { LevelableTalentType } from "@/types";

export type CalcResultItem = CalcAttackItemOutputs | CalcOtherItemOutputs | CalcReactionOutputs;

export type CalcResultGroup = Map<string, CalcResultItem>;

export type CalcResultNew = {
  [key in LevelableTalentType]: CalcResultGroup;
} & {
  EXTRA: CalcResultGroup;
  RXN: CalcResultGroup;
  WP: CalcResultGroup;
};

export type CalcResultKey = keyof CalcResultNew;

import type {
  CalcAttackItemOutputs,
  CalcOtherItemOutputs,
  CalcReactionOutputs,
} from "@/logic/calculation";
import type { LevelableTalentType } from "@/types";

export type BonusPerformTools = {
  inputs: number[];
  refi?: number;
  basedOnStatic?: boolean;
};

export type BareBonus = {
  // id?: string;
  value: number;
  isDynamic: boolean;
};

export type CalcResultItem = CalcAttackItemOutputs | CalcOtherItemOutputs | CalcReactionOutputs;

export type CalcResultGroup = Map<string, CalcResultItem>;

export type CalcResult = {
  [key in LevelableTalentType]: CalcResultGroup;
} & {
  EXTRA: CalcResultGroup;
  RXN: CalcResultGroup;
  WP: CalcResultGroup;
};

export type CalcResultKey = keyof CalcResult;

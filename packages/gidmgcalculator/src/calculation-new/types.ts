import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackPattern,
  AttackReaction,
  BareBonus,
  BonusPerformTools,
  CalcItemBasedOn,
  CalcItemType,
  EffectPerformableCondition,
  ElementType,
  EntityBonusEffect,
  EntityPenaltyEffect,
  ExclusiveAttackBonusGroup,
  LunarType,
  TalentCalcItemBonusId,
} from "@/types";
import type { ResultRecorder } from "./core/ResultRecorder";

export type IEffectPerformer = {
  isPerformableEffect(condition?: EffectPerformableCondition, inputs?: number[]): boolean;
  performBonus(config: EntityBonusEffect, tools: Partial<BonusPerformTools>): BareBonus;
  performPenalty(config: EntityPenaltyEffect, inputs?: number[]): number;
};

// RESULT CALCULATION - INPUT

export type CalcItemDefaultValues = {
  scale: number;
  basedOn: CalcItemBasedOn;
  attPatt: ActualAttackPattern;
  flatFactorScale: number;
};

export type AttackAlterConfig = {
  attPatt?: AttackPattern;
  attElmt?: ElementType;
  disabled?: boolean;
};

// RESULT CALCULATION - OUTPUT

export type ResultItemRecord = {
  specPatt?: LunarType;
  factors: Array<{
    label: string;
    value: number;
    mult?: number;
  }>;
  coefficient?: number;
  baseMult?: number;
  veilMult?: number;
  flat?: number;
  elvMult?: number;
  specMult?: number;
  bonusMult: number;
  rxnMult?: number;
  defMult?: number;
  resMult?: number;
  cRate_?: number;
  cDmg_?: number;
  note?: string;
  exclusives?: ExclusiveAttackBonusGroup[];
};

export type CalcAspect = "base" | "crit" | "average";

export type CalcResultItemValue = Record<CalcAspect, number>;

export type CalcResultItem = {
  exclusiveBonusId?: TalentCalcItemBonusId;
  values: CalcResultItemValue[];
};

export type CalcResultAttackItem = CalcResultItem & {
  type: "attack";
  attElmt: ActualAttackElement;
  attPatt: ActualAttackPattern | LunarType;
  reaction: AttackReaction;
  recorder: ResultRecorder;
};

export type CalcResultOtherItem = CalcResultItem & {
  type: Exclude<CalcItemType, "attack">;
  recorder: ResultRecorder;
};

export type CalcResultReactionItem = CalcResultItem & {
  type: "reaction";
  attElmt: ActualAttackElement;
  reaction: AttackReaction;
  recorder: ResultRecorder;
};

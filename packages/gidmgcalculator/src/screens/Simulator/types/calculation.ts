import type { ResultRecorder } from "@/calculation/core/ResultRecorder";
import type {
  ActualAttackPattern,
  AttackElement,
  AttackReaction,
  ElementType,
  LunarType,
} from "@/types";

export type ForceAttackElement = ElementType | null;

export type CalcResultItem = {
  values: number[];
};

export type CalcResultAttackItem = CalcResultItem & {
  cRate: number;
  cDmg: number;
  attElmt: AttackElement | LunarType;
  attPatt: ActualAttackPattern;
  reaction: AttackReaction;
  recorder: ResultRecorder;
};

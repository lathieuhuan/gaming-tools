import type { ActualAttackPattern, AttackPattern, CalcItemBasedOn, ElementType } from "../common";

export * from "./bonus";
export * from "./teammate";

export type CalcItemDefaultValues = {
  scale: number;
  basedOn: CalcItemBasedOn;
  attPatt: ActualAttackPattern;
  flatFactorScale: number;
};

export type AttackAlter = {
  attPatt?: AttackPattern;
  attElmt?: ElementType;
  disabled?: boolean;
};

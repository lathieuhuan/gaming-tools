import type { CalcItemBasedOn, CalcItemType } from "@/types";

export type CalcAspect = "base" | "crit" | "average";

export type CalcAttackResult = Record<CalcAspect, number>;

export type CalcAttackOutputs = {
  type: "attack";
  baseMult: number;
  flat: number;
  bonusMult: number;
  elvMult: number;
  rxnMult: number;
  defMult: number;
  resMult: number;
  cRate: number;
  cDmg: number;
  results: CalcAttackResult[];
};

export type CalcOtherOutputs = {
  type: Exclude<CalcItemType, "attack">;
  baseMult: number;
  flat: number;
  bonusMult: number;
  result: number;
};

export type CalcItemFactor = {
  attribute: CalcItemBasedOn;
  multiplier: number;
};

export type CalcAttackItemOutputs = CalcAttackOutputs & {
  factors: CalcItemFactor[];
};

export type CalcOtherItemOutputs = CalcOtherOutputs & CalcItemFactor;

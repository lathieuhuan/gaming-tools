import type {
  ActualAttackPattern,
  AttackElement,
  CalcItemBasedOn,
  CalcItemType,
  SpecialAttackPattern,
  TalentCalcItemBonusId,
} from "@/types";

export type CalcAspect = "base" | "crit" | "average";

export type CalcAttackResult = Record<CalcAspect, number>;

export type CalcAttackOutputs = {
  type: "attack";
  bonusId: TalentCalcItemBonusId | undefined;
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
  attElmt: AttackElement;
  attPatt: ActualAttackPattern;
  specPatt: SpecialAttackPattern | undefined; // TODO check
};

export type CalcOtherOutputs = {
  type: Exclude<CalcItemType, "attack">;
  bonusId: TalentCalcItemBonusId | undefined;
  baseMult: number;
  flat: number;
  bonusMult: number;
  inHealMult: number;
  result: number;
};

export type CalcItemFactor = {
  basedOnValue: number;
  basedOnAttr: CalcItemBasedOn;
  multiplier: number;
};

export type CalcAttackItemOutputs = CalcAttackOutputs & {
  factors: CalcItemFactor[];
};

export type CalcOtherItemOutputs = CalcOtherOutputs & CalcItemFactor;

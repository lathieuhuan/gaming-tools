import type {
  ActualAttackPattern,
  AttackElement,
  CalcItemBasedOn,
  CalcItemType,
  TalentCalcItemBonusId,
  TalentReaction,
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
};

export type CalcReactionResult = Record<CalcAspect, number>;

export type CalcOtherOutputs = {
  type: Exclude<CalcItemType, "attack">;
  bonusId: TalentCalcItemBonusId | undefined;
  baseMult: number;
  flat: number;
  bonusMult: number;
  inHealMult: number;
  result: number;
};

export type CalcReactionBaseOutputs = {
  type: "reaction";
  bonusId: TalentCalcItemBonusId | undefined;
  coefficient: number;
  rxnBaseMult: number;
  bonusMult: number;
  flat: number;
  elvMult: number;
  rxnMult: number;
  resMult: number;
  cRate: number;
  cDmg: number;
  results: CalcReactionResult[];
  attElmt: AttackElement;
};

export type CalcItemFactor = {
  basedOnValue: number;
  basedOnAttr: CalcItemBasedOn;
  multiplier: number;
};

export type CalcAttackItemOutputs = CalcAttackOutputs & {
  factors: CalcItemFactor[];
};

export type NatureCalcReactionOutputs = CalcReactionBaseOutputs & {
  subType: "nature";
};

export type DirectCalcReactionOutputs = CalcReactionBaseOutputs & {
  subType: "direct";
  reaction: TalentReaction;
  factors: CalcItemFactor[];
};

export type CalcReactionOutputs = NatureCalcReactionOutputs | DirectCalcReactionOutputs;

export type CalcOtherItemOutputs = CalcOtherOutputs & CalcItemFactor;

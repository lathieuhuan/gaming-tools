import { toMult } from "ron-utils";

import type { Character, GetAttackBonusPaths } from "@/models/Character";
import type { Target } from "@/models/Target";
import type {
  ActualAttackElement,
  ActualAttackPattern,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  ElementType,
  LunarType,
  StellarType,
  TalentCalcItemBonusId,
  TransformativeReaction,
} from "@/types";
import type { CalcReactionBaseOutputs, CalcReactionResult } from "./types";

import { limitCRate } from "@/utils/stat.utils";

type CalcReactionInputs = {
  bonusId?: TalentCalcItemBonusId;
  coefficient?: number;
  attPatt?: ActualAttackPattern;
  absorption?: ElementType | null;
  absorbReaction?: AttackReaction;
  extraCRate?: number;
  extraCDmg?: number;
};

export function calcReaction(
  performer: Character,
  target: Target,
  bases: number[],
  attElmt: ActualAttackElement,
  reaction: TransformativeReaction | LunarType | StellarType,
  inputs: CalcReactionInputs = {},
): CalcReactionBaseOutputs {
  const {
    bonusId,
    coefficient = 1,
    absorption,
    absorbReaction,
    extraCRate = 0,
    extraCDmg = 0,
  } = inputs;

  const getBonusPaths: GetAttackBonusPaths = [bonusId, reaction];

  let attElmt_: AttackElement;
  let rxnMult = 1;

  if (attElmt === "absorb") {
    if (absorption) {
      attElmt_ = absorption;

      getBonusPaths.push(`swirl.${absorption}`);

      if (absorbReaction === "melt" || absorbReaction === "vaporize") {
        rxnMult = performer.amplifyingReactionMult(absorbReaction, attElmt_);
      }
    } else {
      attElmt_ = "anemo";
    }
  } else {
    attElmt_ = attElmt;
  }

  function getBonus(key: AttackBonusKey, extraPaths: GetAttackBonusPaths = []) {
    return performer.attkBonusCtrl.get(key, [...getBonusPaths, ...extraPaths]);
  }

  const rxnBaseMult = toMult(getBonus("rxnBaseMult_"));
  const bonusMult = toMult(getBonus("pct_"));
  const flat = getBonus("flat");
  const elvMult = toMult(getBonus("elvMult_"));
  const resMult = target.resistMults[attElmt_];

  // console.log("reaction", reaction);
  // console.log("performer.attkBonusCtrl", performer.attkBonusCtrl);
  // console.log("bonusMult", bonusMult);

  const cRate = (limitCRate(getBonus("cRate_", [attElmt_])) + extraCRate) / 100;
  const cDmg = (getBonus("cDmg_", [attElmt_]) + extraCDmg) / 100;

  const cDmgMult = 1 + cDmg;
  const averageMult = 1 + cRate * cDmg;

  const results = bases.map<CalcReactionResult>((value) => {
    const base =
      (coefficient * value * rxnBaseMult * bonusMult + flat) * elvMult * rxnMult * resMult;

    return {
      base,
      crit: cRate !== 0 ? base * cDmgMult : 0,
      average: base * averageMult,
    };
  });

  return {
    type: "reaction",
    bonusId,
    coefficient,
    rxnBaseMult,
    bonusMult,
    flat,
    elvMult,
    rxnMult,
    resMult,
    cRate,
    cDmg,
    results,
    attElmt: attElmt_,
  };
}

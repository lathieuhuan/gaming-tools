import { toMult } from "ron-utils";

import type { Character, GetAttackBonusPaths } from "@/models/Character";
import type { Target } from "@/models/Target";
import type {
  ActualAttackElement,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  ElementalEvent,
  ElementType,
  LunarReaction,
  StellarReaction,
  TalentCalcItemBonusId,
  TransformativeReaction,
} from "@/types";
import type {
  CalcReactionBaseOutputs,
  CalcReactionResult,
  TraditionalCalcReactionOutputs,
} from "./types";

import { limitCRate } from "@/utils/stat.utils";

type CalcReactionInputs = {
  bonusId?: TalentCalcItemBonusId;
  coefficient?: number;
  absorption?: ElementType | null;
  absorbReaction?: AttackReaction;
};

type TraditionalReaction = TransformativeReaction | LunarReaction | StellarReaction;

export function calcReaction(
  performer: Character,
  target: Target,
  bases: number[],
  attElmt: ActualAttackElement,
  reaction: TraditionalReaction,
  inputs: CalcReactionInputs = {},
): CalcReactionBaseOutputs {
  const { bonusId, coefficient = 1, absorption, absorbReaction } = inputs;

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

  function getBonus(key: AttackBonusKey) {
    return performer.attkBonusCtrl.get(key, getBonusPaths);
  }

  const rxnBaseMult = toMult(getBonus("rxnBaseMult_"));
  const bonusMult = toMult(getBonus("pct_"));
  const flat = getBonus("flat");
  const elvMult = toMult(getBonus("elvMult_"));
  const resMult = target.resistMults[attElmt_];

  const cRate = limitCRate(getBonus("cRate_")) / 100;
  const cDmg = getBonus("cDmg_") / 100;

  const cDmgMult = 1 + cDmg;
  const averageMult = 1 + cRate * cDmg;

  const results = bases.map<CalcReactionResult>((value) => {
    const base =
      (coefficient * value * rxnBaseMult * bonusMult + flat) * elvMult * rxnMult * resMult;

    return {
      base,
      crit: base * cDmgMult,
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

export function calcTraditionalReaction(
  performer: Character,
  target: Target,
  reaction: TraditionalReaction,
  elmtEvent: ElementalEvent,
): TraditionalCalcReactionOutputs {
  let coefficient = 1;
  let attElmt: ActualAttackElement;

  switch (reaction) {
    case "lunarCharged":
    case "lunarCryst": {
      const spec = LUNAR_REACTION_COEFFICIENT[reaction];

      coefficient = spec.coef;
      attElmt = spec.attElmt;
      break;
    }
    case "stellarSwirl":
      coefficient = 0.75;
      attElmt = "anemo";
      break;
    case "stellarVortex":
      coefficient = elmtEvent.vortexLv === 3 ? 3 : 2;
      attElmt = "cryo";
      break;
    default: {
      const spec = TRANSFORMATIVE_REACTION_SPEC[reaction];

      coefficient = spec.coef;
      attElmt = spec.attElmt;
    }
  }

  const { baseReactionDMG } = performer;

  const outputs = calcReaction(performer, target, [baseReactionDMG], attElmt, reaction, {
    coefficient,
    absorption: elmtEvent.absorption,
    absorbReaction: elmtEvent.absorbReaction,
  });

  return {
    ...outputs,
    subType: "traditional",
  };
}

type ReactionSpec = {
  coef: number;
  attElmt: ActualAttackElement;
};

export const LUNAR_REACTION_COEFFICIENT: Record<LunarReaction, ReactionSpec> = {
  lunarCharged: { coef: 1.8, attElmt: "electro" },
  lunarCryst: { coef: 0.96, attElmt: "geo" },
};

const TRANSFORMATIVE_REACTION_SPEC: Record<TransformativeReaction, ReactionSpec> = {
  bloom: { coef: 2, attElmt: "dendro" },
  hyperbloom: { coef: 3, attElmt: "dendro" },
  burgeon: { coef: 3, attElmt: "dendro" },
  burning: { coef: 0.25, attElmt: "pyro" },
  swirl: { coef: 0.6, attElmt: "absorb" },
  superconduct: { coef: 1.5, attElmt: "cryo" },
  electroCharged: { coef: 2, attElmt: "electro" },
  overloaded: { coef: 2.75, attElmt: "pyro" },
  shattered: { coef: 3, attElmt: "phys" },
};

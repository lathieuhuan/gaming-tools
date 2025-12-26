import type {
  ActualAttackElement,
  AttackBonusKey,
  ElementalEvent,
  LunarReaction,
  TransformativeReaction,
} from "@/types";
import type { CalcTarget } from "./CalcTarget";
import type { CharacterCalc } from "./CharacterCalc";
import type { ResultRecorder } from "./ResultRecorder";

import { toMult } from "@/utils/pure-utils";
import { CalcResultReactionItem } from "../types";
import { limitCRate } from "./utils";
import { LUNAR_ATTACK_ELEMENT, LUNAR_REACTION_COEFFICIENT } from "../constants";

const TRANSFORMATIVE_REACTION_CONFIG: Record<
  TransformativeReaction,
  { mult: number; attElmt: ActualAttackElement }
> = {
  bloom: { mult: 2, attElmt: "dendro" },
  hyperbloom: { mult: 3, attElmt: "dendro" },
  burgeon: { mult: 3, attElmt: "dendro" },
  burning: { mult: 0.25, attElmt: "pyro" },
  swirl: { mult: 0.6, attElmt: "absorb" },
  superconduct: { mult: 1.5, attElmt: "cryo" },
  electroCharged: { mult: 2, attElmt: "electro" },
  overloaded: { mult: 2.75, attElmt: "pyro" },
  shattered: { mult: 3, attElmt: "phys" },
};

export function makeReactionCalc(performer: CharacterCalc, target: CalcTarget) {
  const { attkBonusCtrl, totalAttrs, baseRxnDamage } = performer;

  function calcLunarReaction(
    reaction: LunarReaction,
    recorder: ResultRecorder
  ): CalcResultReactionItem {
    function getBonus(key: AttackBonusKey) {
      return attkBonusCtrl.get(key, reaction);
    }

    const mult = LUNAR_REACTION_COEFFICIENT[reaction];
    const baseValue = baseRxnDamage * mult;
    const baseMult = toMult(getBonus("multPlus_"));
    const bonusMult = 1 + getBonus("pct_") / 100;
    const elvMult = toMult(getBonus("elvMult_"));
    const flat = getBonus("flat");
    const rxnMult = 1;

    const attElmt = LUNAR_ATTACK_ELEMENT[reaction];
    const resMult = target.resistMults[attElmt];

    const base = (baseValue * baseMult * bonusMult * elvMult + flat) * rxnMult * resMult;
    const cRate_ = limitCRate(getBonus("cRate_") + totalAttrs.get("cRate_")) / 100;
    const cDmg_ = (getBonus("cDmg_") + totalAttrs.get("cDmg_")) / 100;

    recorder.record({
      factors: [{ value: Math.round(baseValue), label: "Base DMG" }],
      flat,
      baseMult,
      bonusMult,
      rxnMult,
      resMult,
      cDmg_,
      cRate_,
    });

    return {
      type: "reaction",
      values: [
        {
          base,
          crit: cDmg_ ? base * (1 + cDmg_) : 0,
          average: cRate_ ? base * (1 + cDmg_ * cRate_) : base,
        },
      ],
      attElmt,
      reaction: null,
      recorder,
    };
  }

  function calcReaction(
    reaction: TransformativeReaction,
    recorder: ResultRecorder,
    elmtEvent?: ElementalEvent
  ): CalcResultReactionItem {
    function getBonus(key: AttackBonusKey) {
      return attkBonusCtrl.get(key, reaction);
    }

    const config = TRANSFORMATIVE_REACTION_CONFIG[reaction];
    const baseValue = baseRxnDamage * config.mult;
    const bonusMult = 1 + getBonus("pct_") / 100;
    const flat = getBonus("flat");
    let attElmt = config.attElmt;
    let rxnMult = 1;
    let resMult = 1;

    if (config.attElmt === "absorb") {
      if (elmtEvent?.absorption) {
        const { absorbReaction } = elmtEvent;

        attElmt = elmtEvent.absorption;
        resMult = target.resistMults[attElmt];

        if (absorbReaction === "melt" || absorbReaction === "vaporize") {
          rxnMult = performer.getAmplifyingMult(absorbReaction, attElmt);
        }
      }
    } else {
      resMult = target.resistMults[config.attElmt];
    }

    const base = (baseValue * bonusMult + flat) * rxnMult * resMult;
    const cRate_ = limitCRate(getBonus("cRate_")) / 100;
    const cDmg_ = getBonus("cDmg_") / 100;

    recorder.record({
      factors: [{ value: Math.round(baseValue), label: "Base DMG" }],
      flat,
      bonusMult,
      rxnMult,
      resMult,
      cDmg_,
      cRate_,
    });

    return {
      type: "reaction",
      values: [
        {
          base,
          crit: cDmg_ ? base * (1 + cDmg_) : 0,
          average: cRate_ ? base * (1 + cDmg_ * cRate_) : base,
        },
      ],
      attElmt,
      reaction: null,
      recorder,
    };
  }

  return {
    calcLunarReaction,
    calcReaction,
  };
}

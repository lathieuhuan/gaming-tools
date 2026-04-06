import { toMult } from "ron-utils";

import type { Character, TargetCalc } from "@/models";
import type {
  ActualAttackElement,
  AttackBonusKey,
  AttackElement,
  ElementalEvent,
  LunarReaction,
  TransformativeReaction,
} from "@/types";
import type { CalcResultReactionItem } from "../types";
import type { ResultRecorder } from "./ResultRecorder";

import { limitCRate } from "@/logic/stat.logic";
import { LUNAR_ATTACK_ELEMENT, LUNAR_REACTION_COEFFICIENT } from "../constants";
import { GetBonusPaths } from "@/models/Character";

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

export function makeReactionCalc(performer: Character, target: TargetCalc) {
  const { attkBonusCtrl, baseRxnDamage } = performer;

  function calcLunarReaction(
    reaction: LunarReaction,
    recorder: ResultRecorder
  ): CalcResultReactionItem {
    const getBonus = (key: AttackBonusKey, paths: GetBonusPaths = []) => {
      return attkBonusCtrl.get(key, [reaction, ...paths]);
    };

    const mult = LUNAR_REACTION_COEFFICIENT[reaction];
    const baseValue = baseRxnDamage * mult;
    const baseMult = toMult(getBonus("baseMult_"));
    const bonusMult = 1 + getBonus("pct_") / 100;
    const elvMult = toMult(getBonus("elvMult_"));
    const flat = getBonus("flat");
    const rxnMult = 1;

    const attElmt = LUNAR_ATTACK_ELEMENT[reaction];
    const resMult = target.resistMults[attElmt];

    const base = (baseValue * baseMult * bonusMult * elvMult + flat) * rxnMult * resMult;
    const cRate_ =
      limitCRate(getBonus("cRate_", [attElmt]) + performer.getAttr("cRate_")) / 100;
    const cDmg_ = (getBonus("cDmg_", [attElmt]) + performer.getAttr("cDmg_")) / 100;

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
      return attkBonusCtrl.get(key, [reaction]);
    }

    const config = TRANSFORMATIVE_REACTION_CONFIG[reaction];
    const baseValue = baseRxnDamage * config.mult;
    const bonusMult = 1 + getBonus("pct_") / 100;
    const flat = getBonus("flat");
    let attElmt: AttackElement;
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
      } else {
        attElmt = "anemo";
      }
    } else {
      attElmt = config.attElmt;
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

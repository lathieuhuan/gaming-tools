import { toMult } from "ron-utils";

import type { Character, TargetCalc } from "@/models";
import type { GetAttackBonusPaths } from "@/models/Character";
import type {
  ActualAttackPattern,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  TalentCalcItemBonusId,
} from "@/types";
import type { CalcResultAttackItem, CalcResultItemValue } from "../types";
import type { ResultRecorder } from "./ResultRecorder";

import { limitCRate } from "@/logic/stat.logic";

type MakeAttackCalcTools = {
  attElmt?: AttackElement;
  attPatt?: ActualAttackPattern;
  itemId?: TalentCalcItemBonusId;
  reaction?: AttackReaction;
};

export function makeAttackItemCalc(
  performer: Character,
  target: TargetCalc,
  tools: MakeAttackCalcTools = {},
) {
  const { attkBonusCtrl, bareLv } = performer;
  const { attElmt = "phys", attPatt = "none", itemId, reaction = null } = tools;

  function getBonus(key: AttackBonusKey) {
    const paths: GetAttackBonusPaths = ["all", attElmt, itemId];

    if (attPatt !== "none") {
      paths.push(attPatt, `${attPatt}.${attElmt}`);
    }

    return attkBonusCtrl.get(key, paths);
  }

  function calculate(bases: number[], recorder: ResultRecorder): CalcResultAttackItem {
    // BASE MULTIPLIER
    let baseMult = getBonus("baseMult_");
    baseMult = baseMult >= 0 ? toMult(baseMult) : -baseMult / 100;

    // FLAT
    let flat = getBonus("flat");

    if (attElmt === "dendro" && reaction === "spread") {
      flat += performer.quickenDamageBonus("spread");
    }
    if (attElmt === "electro" && reaction === "aggravate") {
      flat += performer.quickenDamageBonus("aggravate");
    }

    const bonusMult = toMult(getBonus("pct_") + performer.getAttr(attElmt));
    const elvMult = toMult(getBonus("elvMult_"));

    // REACTION MULTIPLIER
    let rxnMult = 1;

    if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
      // deal elemental DMG and want amplifying reaction
      rxnMult = performer.amplifyingReactionMult(reaction, attElmt);
    }

    // DEFENSE MULTIPLIER
    const defIgnMult = 1 - getBonus("defIgn_") / 100;
    const defMult =
      (bareLv + 100) / (target.defReduceMult * defIgnMult * (target.level + 100) + (bareLv + 100));

    // RESISTANCE MULTIPLIER
    const resMult = target.resistMults[attElmt];

    // CRITS
    const cRate_ = limitCRate(performer.getAttr("cRate_") + getBonus("cRate_")) / 100;
    const cDmg_ = (performer.getAttr("cDmg_") + getBonus("cDmg_")) / 100;
    const cDmgMult = 1 + cDmg_;
    const averageMult = 1 + cRate_ * cDmg_;

    const values = bases.map<CalcResultItemValue>((value) => {
      const base = (value * baseMult + flat) * bonusMult * elvMult * rxnMult * defMult * resMult;

      return {
        base,
        crit: base * cDmgMult,
        average: base * averageMult,
      };
    });

    recorder.record({
      baseMult: Math.abs(baseMult),
      flat,
      bonusMult,
      elvMult,
      rxnMult,
      defMult,
      resMult,
      cRate_,
      cDmg_,
    });

    return {
      exclusiveBonusId: itemId,
      type: "attack",
      values,
      attElmt,
      attPatt,
      specPatt: null,
      reaction,
      recorder,
    };
  }

  return {
    getBonus,
    calculate,
  };
}

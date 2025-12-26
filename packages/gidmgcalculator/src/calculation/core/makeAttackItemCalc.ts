import type {
  ActualAttackPattern,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  TalentCalcItemBonusId,
} from "@/types";
import type { CalcResultAttackItem, CalcResultItemValue } from "../types";
import type { CalcTarget } from "./CalcTarget";
import type { CharacterCalc } from "./CharacterCalc";
import type { ResultRecorder } from "./ResultRecorder";

import { toMult } from "@/utils";
import { limitCRate } from "./utils";

type MakeAttackCalcTools = {
  attElmt?: AttackElement;
  attPatt?: ActualAttackPattern;
  itemId?: TalentCalcItemBonusId;
  reaction?: AttackReaction;
};

export function makeAttackItemCalc(
  performer: CharacterCalc,
  target: CalcTarget,
  tools: MakeAttackCalcTools = {}
) {
  const { totalAttrs, attkBonusCtrl, bareLv } = performer;
  const { attElmt = "phys", attPatt = "none", itemId, reaction = null } = tools;

  function getBonus(key: AttackBonusKey) {
    return attPatt === "none"
      ? attkBonusCtrl.get(key, "all", attElmt, itemId)
      : attkBonusCtrl.get(key, "all", attElmt, itemId, attPatt, `${attPatt}.${attElmt}`);
  }

  function calculate(bases: number[], recorder: ResultRecorder): CalcResultAttackItem {
    // BASE MULTIPLIER
    let baseMult = getBonus("multPlus_");
    baseMult = baseMult >= 0 ? toMult(baseMult) : -baseMult / 100;

    const flat = getBonus("flat");
    const bonusMult = toMult(getBonus("pct_") + totalAttrs.get(attElmt));
    const specMult = toMult(getBonus("specMult_"));
    const elvMult = toMult(getBonus("elvMult_"));

    // REACTION MULTIPLIER
    let rxnMult = 1;

    if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
      // deal elemental DMG and want amplifying reaction
      rxnMult = performer.getAmplifyingMult(reaction, attElmt);
    }

    // DEFENSE MULTIPLIER
    const defIgnMult = 1 - getBonus("defIgn_") / 100;
    const defMult =
      (bareLv + 100) / (target.defReduceMult * defIgnMult * (target.level + 100) + (bareLv + 100));

    // RESISTANCE MULTIPLIER
    const resMult = target.resistMults[attElmt];

    // CRITS
    const cRate_ = limitCRate(totalAttrs.get("cRate_") + getBonus("cRate_")) / 100;
    const cDmg_ = (totalAttrs.get("cDmg_") + getBonus("cDmg_")) / 100;
    const cDmgMult = 1 + cDmg_;
    const averageMult = 1 + cRate_ * cDmg_;

    const values = bases.map<CalcResultItemValue>((value) => {
      const base =
        (value * baseMult + flat) * bonusMult * specMult * elvMult * rxnMult * defMult * resMult;

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
      specMult,
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
      reaction,
      recorder,
    };
  }

  return {
    getBonus,
    calculate,
  };
}

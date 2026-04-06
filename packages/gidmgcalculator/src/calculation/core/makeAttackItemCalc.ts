import { toMult } from "ron-utils";

import type { Character, TargetCalc } from "@/models";
import type {
  ActualAttackPattern,
  AttackBonus,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  TalentCalcItemBonusId,
} from "@/types";
import type { CalcResultAttackItem, CalcResultItemValue } from "../types";
import type { ResultRecorder } from "./ResultRecorder";

import { limitCRate } from "@/logic/stat.logic";
import { GetBonusOptions } from "@/models/Character";
import { QUICKEN_BUFF_LABEL } from "../constants";

type MakeAttackCalcTools = {
  attElmt?: AttackElement;
  attPatt?: ActualAttackPattern;
  itemId?: TalentCalcItemBonusId;
  reaction?: AttackReaction;
  noU?: boolean;
};

export function makeAttackItemCalc(
  performer: Character,
  target: TargetCalc,
  tools: MakeAttackCalcTools = {}
) {
  const { attkBonusCtrl, bareLv } = performer;
  const { attElmt = "phys", attPatt = "none", itemId, reaction = null, noU = false } = tools;

  let filterBonus: GetBonusOptions["filter"];

  if (noU) {
    filterBonus = (bonus: AttackBonus) =>
      bonus.label !== QUICKEN_BUFF_LABEL.spread && bonus.label !== QUICKEN_BUFF_LABEL.aggravate;
  }

  function getBonus(key: AttackBonusKey) {
    if (attPatt === "none") {
      return attkBonusCtrl.get(key, ["all", attElmt, itemId], { filter: filterBonus });
    }

    return attkBonusCtrl.get(key, ["all", attElmt, itemId, attPatt, `${attPatt}.${attElmt}`], {
      filter: filterBonus,
    });
  }

  function calculate(bases: number[], recorder: ResultRecorder): CalcResultAttackItem {
    // BASE MULTIPLIER
    let baseMult = getBonus("baseMult_");
    baseMult = baseMult >= 0 ? toMult(baseMult) : -baseMult / 100;

    const flat = getBonus("flat");
    const bonusMult = toMult(getBonus("pct_") + performer.getAttr(attElmt));
    const specMult = toMult(getBonus("specMult_"));
    const elvMult = toMult(getBonus("elvMult_"));

    // REACTION MULTIPLIER
    let rxnMult = 1;

    if (!noU && attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
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
    const cRate_ = limitCRate(performer.getAttr("cRate_") + getBonus("cRate_")) / 100;
    const cDmg_ = (performer.getAttr("cDmg_") + getBonus("cDmg_")) / 100;
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

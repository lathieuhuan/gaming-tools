import { toMult } from "ron-utils";

import type { Character, GetAttackBonusPaths, Target } from "@/models";
import type {
  ActualAttackPattern,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  TalentCalcItemBonusId,
} from "@/types";
import type { CalcAttackOutputs, CalcAttackResult } from "./types";

import { limitCRate } from "@/utils/stat.utils";

type CalcAttackInputs = {
  itemId?: TalentCalcItemBonusId;
  attElmt?: AttackElement;
  attPatt?: ActualAttackPattern;
  reaction?: AttackReaction;
};

export function calcAttack(
  performer: Character,
  target: Target,
  bases: number[],
  inputs: CalcAttackInputs,
): CalcAttackOutputs {
  const { itemId, attElmt = "phys", attPatt = "none", reaction = null } = inputs;

  function getBonus(key: AttackBonusKey) {
    const paths: GetAttackBonusPaths = ["all", attElmt, itemId];

    if (attPatt !== "none") {
      paths.push(attPatt, `${attPatt}.${attElmt}`);
    }

    return performer.attkBonusCtrl.get(key, paths);
  }

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
    (performer.bareLv + 100) /
    (target.defReduceMult * defIgnMult * (target.level + 100) + (performer.bareLv + 100));

  // RESISTANCE MULTIPLIER
  const resMult = target.resistMults[attElmt];

  // CRITS
  const cRate = limitCRate(performer.getAttr("cRate_") + getBonus("cRate_")) / 100;
  const cDmg = (performer.getAttr("cDmg_") + getBonus("cDmg_")) / 100;

  const cDmgMult = 1 + cDmg;
  const averageMult = 1 + cRate * cDmg;

  const results = bases.map<CalcAttackResult>((value) => {
    const base = (value * baseMult + flat) * bonusMult * elvMult * rxnMult * defMult * resMult;

    return {
      base,
      crit: base * cDmgMult,
      average: base * averageMult,
    };
  });

  return {
    type: "attack",
    baseMult,
    flat,
    bonusMult,
    elvMult,
    rxnMult,
    defMult,
    resMult,
    cRate,
    cDmg,
    results,
  };
}

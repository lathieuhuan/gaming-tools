import { toMult } from "ron-utils";

import { CalcResultItemValue } from "@/calculation/types";
import { Character, GetAttackBonusPaths } from "@/models/Character";
import {
  ActualAttackPattern,
  AttackBonusKey,
  AttackElement,
  AttackReaction,
  TalentCalcItemBonusId,
} from "@/types";
import { limitCRate } from "@/utils/stat.utils";
import { Target } from "./Target";

type AttackCalcInputs = {
  performer: Character;
  target: Target;
  itemId?: TalentCalcItemBonusId;
  attElmt?: AttackElement;
  attPatt?: ActualAttackPattern;
  reaction?: AttackReaction;
};

type AttackCalcSpec = {
  coefficient: number;
  baseMult: number;
  flat: number;
  elvMult: number;
  bonusMult: number;
  rxnMult: number;
  defMult: number;
  resMult: number;
};

export class AttackCalc implements AttackCalcSpec {
  performer: Character;
  itemId?: TalentCalcItemBonusId;
  attElmt: AttackElement;
  attPatt: ActualAttackPattern;
  reaction: AttackReaction;

  coefficient = 1;
  baseMult = 1;
  flat = 0;
  bonusMult = 1;
  elvMult = 1;
  rxnMult = 1;
  defMult = 1;
  resMult = 1;
  cRate = 0;
  cDmg = 0;

  results: CalcResultItemValue[] = [];

  constructor(inputs: AttackCalcInputs) {
    const {
      performer,
      target,
      attElmt = "phys",
      attPatt = "none",
      itemId,
      reaction = null,
    } = inputs;

    this.performer = performer;
    this.itemId = itemId;
    this.attElmt = attElmt;
    this.attPatt = attPatt;
    this.reaction = reaction;

    const baseMult = this.getBonus("baseMult_");
    this.baseMult = baseMult >= 0 ? toMult(baseMult) : -baseMult / 100;

    // FLAT
    this.flat = this.getBonus("flat");

    if (attElmt === "dendro" && reaction === "spread") {
      this.flat += performer.quickenDamageBonus("spread");
    }
    if (attElmt === "electro" && reaction === "aggravate") {
      this.flat += performer.quickenDamageBonus("aggravate");
    }

    this.bonusMult = toMult(this.getBonus("pct_") + performer.getAttr(attElmt));
    this.elvMult = toMult(this.getBonus("elvMult_"));

    // REACTION MULTIPLIER
    if (attElmt !== "phys" && (reaction === "melt" || reaction === "vaporize")) {
      // deal elemental DMG and want amplifying reaction
      this.rxnMult = performer.amplifyingReactionMult(reaction, attElmt);
    }

    // DEFENSE MULTIPLIER
    const defIgnMult = 1 - this.getBonus("defIgn_") / 100;
    const bareLv = performer.bareLv;
    this.defMult =
      (bareLv + 100) / (target.defReduceMult * defIgnMult * (target.level + 100) + (bareLv + 100));

    // RESISTANCE MULTIPLIER
    this.resMult = target.resistMults[attElmt];

    // CRITS
    this.cRate = limitCRate(performer.getAttr("cRate_") + this.getBonus("cRate_")) / 100;
    this.cDmg = (performer.getAttr("cDmg_") + this.getBonus("cDmg_")) / 100;
  }

  getBonus(key: AttackBonusKey) {
    const { attElmt, attPatt } = this;
    const paths: GetAttackBonusPaths = ["all", attElmt, this.itemId];

    if (attPatt !== "none") {
      paths.push(attPatt, `${attPatt}.${attElmt}`);
    }

    return this.performer.attkBonusCtrl.get(key, paths);
  }

  calculate(bases: number[]) {
    const { baseMult, flat, bonusMult, elvMult, rxnMult, defMult, resMult, cRate, cDmg } = this;
    const cDmgMult = 1 + cDmg;
    const averageMult = 1 + cRate * cDmg;

    const results = bases.map<CalcResultItemValue>((value) => {
      const base = (value * baseMult + flat) * bonusMult * elvMult * rxnMult * defMult * resMult;

      return {
        base,
        crit: base * cDmgMult,
        average: base * averageMult,
      };
    });

    this.results = results;
  }
}

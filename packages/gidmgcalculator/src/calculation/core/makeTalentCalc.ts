import type {
  AttackBonusKey,
  AttackElement,
  CalcItemFactor,
  ElementalEvent,
  LevelableTalentType,
  LunarType,
  TalentCalcItem,
} from "@/types";
import type {
  AttackAlterConfig,
  CalcItemDefaultValues,
  CalcResultAttackItem,
  CalcResultItemValue,
  CalcResultOtherItem,
} from "../types";
import type { CalcTarget } from "./CalcTarget";
import type { CharacterCalc } from "./CharacterCalc";
import type { ResultRecorder } from "./ResultRecorder";

import { Character } from "@/models/base";
import Array_ from "@/utils/Array";
import { toMult } from "@/utils/pure-utils";
import { makeAttackItemCalc } from "./makeAttackItemCalc";
import { makeOtherItemCalc } from "./makeOtherItemCalc";
import { limitCRate } from "./utils";
import { LUNAR_ATTACK_COEFFICIENT, LUNAR_ATTACK_ELEMENT } from "../constants";

export function makeTalentCalc(
  performer: CharacterCalc,
  target: CalcTarget,
  talentType: LevelableTalentType,
  default_: CalcItemDefaultValues,
  alterConfig: AttackAlterConfig = {}
) {
  const { totalAttrs, attkBonusCtrl } = performer;
  const { vision, weaponType } = performer.data;
  const level = performer.getFinalTalentLv(talentType);

  function parseFactor(factor: CalcItemFactor) {
    const {
      root,
      scale = default_.scale,
      basedOn = default_.basedOn,
    } = typeof factor === "number" ? { root: factor } : factor;

    return {
      root,
      scale,
      basedOn,
    };
  }

  function getBases(item: TalentCalcItem, extraTalentMult: number, recorder: ResultRecorder) {
    const bases: number[] = [];

    for (const factor of Array_.toArray(item.factor)) {
      const { root, scale, basedOn } = parseFactor(factor);
      const value = totalAttrs.get(basedOn);
      const totalMult = root * Character.getTalentMult(scale, level) + extraTalentMult;

      bases.push((value * totalMult) / 100);

      recorder.record({
        factors: recorder.data.factors.concat({
          value,
          label: basedOn,
          mult: totalMult,
        }),
      });
    }

    return item.jointFactors ? [bases.reduce((acc, base) => acc + base, 0)] : bases;
  }

  // ===== NORMAL ATTACK ITEM =====

  function calcAttackItem(
    item: TalentCalcItem,
    elmtEvent: ElementalEvent,
    recorder: ResultRecorder
  ): CalcResultAttackItem {
    const { absorption, absorbReaction, infusion, infuseReaction } = elmtEvent;

    const attPatt = alterConfig.attPatt || item.attPatt || default_.attPatt;
    let attElmt: AttackElement;
    let reaction = elmtEvent.reaction;

    {
      // AttackElement priority:
      // 0. anemo absorption
      // 1. NAs of (catalyst) or FCA
      // 2. item.attElmt
      // 3. infusedElmt (custom infusion) (if NAs)
      // 4. alterConfig
      // 5. phys (if NAs) | performer.vision (otherwise)

      if (item.attElmt === "absorb") {
        // this attack can absorb element (anemo abilities) but user may not activate absorption
        attElmt = absorption || "anemo";
        reaction = absorbReaction;
      } //
      else if (talentType === "NAs") {
        // The element of these attacks is the same as the character's element (vision)
        if (weaponType === "catalyst" || item.subAttPatt === "FCA") {
          attElmt = vision;
        } //
        else if (item.attElmt) {
          attElmt = item.attElmt;
        }
        // There is Custom (external) Infusion
        else if (infusion) {
          attElmt = infusion;
          reaction = infuseReaction;

          // if external infusion is the same as self infusion or character's element,
          // infuse_reaction should be null and reaction (default) should be used instead
          if (infusion === alterConfig.attElmt || infusion === vision) {
            reaction = elmtEvent.reaction;
          }
        } //
        else {
          attElmt = alterConfig.attElmt || "phys";
        }
      } //
      else {
        attElmt = item.attElmt || alterConfig.attElmt || vision;
      }
    }

    const { getBonus, calculate } = makeAttackItemCalc(performer, target, {
      attElmt,
      attPatt,
      reaction,
      itemId: item.id,
    });

    const bases = getBases(item, getBonus("mult_"), recorder);

    return calculate(bases, recorder);
  }

  // ===== LUNAR ATTACK ITEM =====

  function calcLunarAttackItem(
    item: TalentCalcItem,
    lunar: LunarType,
    recorder: ResultRecorder
  ): CalcResultAttackItem {
    const attPatt = alterConfig.attPatt || item.attPatt || default_.attPatt;
    const attElmt = LUNAR_ATTACK_ELEMENT[lunar];

    function getBonus(key: AttackBonusKey) {
      return key === "pct_"
        ? attkBonusCtrl.get(key, lunar, item.id)
        : attkBonusCtrl.get(key, lunar, item.id, attElmt); // Only ignore "pct_" bonus on attElmt
    }

    const extraTalentMult = getBonus("mult_");
    let bases = getBases(item, extraTalentMult, recorder);

    const baseMult = toMult(getBonus("multPlus_"));
    const coefficient = LUNAR_ATTACK_COEFFICIENT[lunar];
    const bonusMult = toMult(getBonus("pct_"));
    const veilMult = toMult(getBonus("veil_"));
    const flat = getBonus("flat");
    const specMult = toMult(getBonus("specMult_"));
    const elvMult = toMult(getBonus("elvMult_"));
    const resMult = target.resistMults[attElmt];

    // CRITS
    const cRate_ = limitCRate(totalAttrs.get("cRate_") + getBonus("cRate_")) / 100;
    const cDmg_ = (totalAttrs.get("cDmg_") + getBonus("cDmg_")) / 100;
    const cDmgMult = 1 + cDmg_;
    const averageMult = 1 + cRate_ * cDmg_;

    const values = bases.map<CalcResultItemValue>((value) => {
      const core = value * baseMult * coefficient * bonusMult * veilMult + flat;
      const base = core * specMult * elvMult * resMult;

      return {
        base,
        crit: base * cDmgMult,
        average: base * averageMult,
      };
    });

    recorder.record({
      coefficient,
      baseMult,
      bonusMult,
      veilMult,
      flat,
      specMult,
      elvMult,
      resMult,
      cRate_,
      cDmg_,
    });

    return {
      type: "attack",
      values,
      attElmt,
      attPatt,
      reaction: null,
      recorder,
    };
  }

  function calcOtherItem(
    type: CalcResultOtherItem["type"],
    item: TalentCalcItem,
    recorder: ResultRecorder
  ): CalcResultOtherItem {
    const { flatFactor } = item;

    const extraTalentMult = attkBonusCtrl.get("mult_", item.id);
    const base = getBases(item, extraTalentMult, recorder)[0];
    let flat = 0;

    if (flatFactor) {
      const { root, scale = default_.flatFactorScale } =
        typeof flatFactor === "number" ? { root: flatFactor } : flatFactor;
      const extraBase = root * Character.getTalentMult(scale, level);

      flat += extraBase;
    }

    return makeOtherItemCalc(performer).calculate(type, base, recorder, flat, item.id);
  }

  return {
    calcAttackItem,
    calcLunarAttackItem,
    calcOtherItem,
  };
}

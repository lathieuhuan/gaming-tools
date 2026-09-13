import type { AttackElement } from "@/types";
import type { CalcSetup } from "../CalcSetup";
import type { CalcResult } from "../types";

import {
  calcAttack,
  CalcItemFactor,
  calcNatureReaction,
  calcOther,
  makeTalentItemCalc,
} from "@/logic/calculation";

import {
  ATTACK_PATTERNS,
  NATURE_LUNAR_REACTIONS,
  NATURE_STELLAR_REACTIONS,
  TRANSFORMATIVE_REACTIONS,
} from "@/constants/global";
import { createExtraCalcItems } from "../createExtraCalcItems";
import { getTalentDefaultValues } from "../getTalentDefaultValues";
import { applyBuffs } from "./applyBuffs";
import { applyDebuffs } from "./applyDebuffs";
import { getAttackAlters } from "./getAttackAlters";

export type CalculateSetupOptions = {
  shouldLog?: boolean;
  resonatedElmts?: AttackElement[];
};

export function calculateSetup(setup: CalcSetup, options: CalculateSetupOptions = {}) {
  const { target, elmtEvent } = setup;
  const main = (setup.main = setup.main.clone());

  const { calcList } = main.data;

  applyBuffs(setup, options);
  applyDebuffs(setup);

  const attackAlters = getAttackAlters(setup);

  const result: CalcResult = {
    NAs: new Map(),
    ES: new Map(),
    EB: new Map(),
    EXTRA: new Map(),
    RXN: new Map(),
    WP: new Map(),
  };

  // ===== TALENT CALCULATION =====

  for (const ATT_PATT of ATTACK_PATTERNS) {
    const talentType = ATT_PATT === "ES" || ATT_PATT === "EB" ? ATT_PATT : "NAs";
    const alterConfig = attackAlters.get(ATT_PATT);
    const defaultValues = getTalentDefaultValues(main.data, ATT_PATT);

    const talentCalc = makeTalentItemCalc(main, target, talentType, defaultValues, alterConfig);

    for (const calcItem of calcList[ATT_PATT]) {
      const { type = "attack", reaction } = calcItem;

      if (type === "attack") {
        if (alterConfig?.disabled) {
          continue;
        }

        if (reaction) {
          result[talentType].set(
            calcItem.name,
            talentCalc.calcReactionItem(calcItem, reaction, elmtEvent),
          );
          continue;
        }

        const itemElmtAlter = calcItem.id && attackAlters.get(calcItem.id)?.attElmt;

        const attackResult = talentCalc.calcAttackItem(calcItem, elmtEvent, {
          attElmtAlter: itemElmtAlter,
        });

        result[talentType].set(calcItem.name, attackResult);
        continue;
      }

      result[talentType].set(calcItem.name, talentCalc.calcOtherItem(calcItem));
    }
  }

  // ===== EXTRA CALCULATION =====

  const extraCalc = makeTalentItemCalc(main, target, null, {
    attPatt: "none",
    basedOn: "atk",
    scale: 0,
    flatFactorScale: 3,
  });

  setup.calcItems = createExtraCalcItems(setup);

  for (const calcItem of setup.calcItems) {
    const { type = "attack" } = calcItem;

    switch (type) {
      case "attack":
        result.EXTRA.set(calcItem.name, extraCalc.calcAttackItem(calcItem, elmtEvent));
        break;
      case "healing":
      case "shield":
      case "other":
        // No extra calculation for healing, shield, and other yet
        break;
      default:
        (type) satisfies never;
    }
  }

  // ===== REACTION CALCULATION =====

  for (const reaction of [
    ...NATURE_STELLAR_REACTIONS,
    ...NATURE_LUNAR_REACTIONS,
    ...TRANSFORMATIVE_REACTIONS,
  ]) {
    result.RXN.set(reaction, calcNatureReaction(main, target, reaction, elmtEvent));
  }

  // ===== WEAPON CALCULATION =====

  const { weapon } = main;

  weapon.data.calcItems?.forEach((calcItem) => {
    const { type = "attack", value, incre = value / 3, basedOn = "atk" } = calcItem;
    const multiplier = value + incre * weapon.refi;
    const attribute = main.getAttr(basedOn);
    const base = (attribute * multiplier) / 100;

    const factor: CalcItemFactor = {
      basedOnValue: value,
      basedOnAttr: basedOn,
      multiplier,
    };

    switch (type) {
      case "attack": {
        const weaponResult = Object.assign(calcAttack(main, target, [base]), {
          factors: [factor],
        });

        result.WP.set(calcItem.name, weaponResult);
        break;
      }
      case "healing":
      case "shield":
      case "other": {
        const otherResult = Object.assign(calcOther(main, type, base), factor);

        result.WP.set(calcItem.name, otherResult);
        break;
      }
      default:
        (type) satisfies never;
    }
  });

  setup.result = result;

  return setup.clone();
}

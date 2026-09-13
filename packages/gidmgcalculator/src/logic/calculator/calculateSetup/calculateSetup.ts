import type { AttackElement } from "@/types";
import type { CalcSetup } from "../CalcSetup";
import type { CalcResultNew } from "../types";

import {
  calcAttack,
  CalcItemFactor,
  calcOther,
  calcStandaloneReaction,
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

  const resultNew: CalcResultNew = {
    NAs: new Map(),
    ES: new Map(),
    EB: new Map(),
    EXTRA: new Map(),
    RXN: new Map(),
    WP: new Map(),
  };

  // const EMPTY_ATTACK_RESULT: CalcResultAttackItem = {
  //   type: "attack",
  //   values: [],
  //   attElmt: "phys",
  //   attPatt: "none",
  //   specPatt: null,
  //   reaction: null,
  //   recorder: new ResultRecorder(),
  // };

  // ===== TALENT CALCULATION =====

  const { polestarProc, polestarCount } = elmtEvent;
  let stellarConductCoefficient = 1;

  if (polestarProc && polestarCount) {
    stellarConductCoefficient += 0.4 + polestarCount * 0.05;
  }

  for (const ATT_PATT of ATTACK_PATTERNS) {
    const talentType = ATT_PATT === "ES" || ATT_PATT === "EB" ? ATT_PATT : "NAs";
    const alterConfig = attackAlters.get(ATT_PATT);
    const defaultValues = getTalentDefaultValues(main.data, ATT_PATT);

    const talentCalc = makeTalentItemCalc(main, target, talentType, defaultValues, alterConfig);

    for (const calcItem of calcList[ATT_PATT]) {
      const { type = "attack", stellar } = calcItem;

      if (type === "attack") {
        if (alterConfig?.disabled) {
          continue;
        }

        if (calcItem.lunar) {
          // resultGroup[calcItem.name] = calculator.calcLunarAttackItem(
          //   calcItem,
          //   calcItem.lunar,
          //   recorder,
          // );
          continue;
        }

        if (stellar) {
          // let coefficient = 1;

          // switch (stellar) {
          //   case "stellarConduct":
          //     coefficient = stellarConductCoefficient;
          //     break;
          //   case "stellarSwirl":
          //     coefficient = 1;
          //     break;
          //   default:
          //     stellar satisfies never;
          // }

          // resultGroup[calcItem.name] = calculator.calcStellarAttackItem(
          //   calcItem,
          //   stellar,
          //   main.data.vision,
          //   coefficient,
          //   recorder,
          // );
          continue;
        }

        const itemElmtAlter = calcItem.id ? attackAlters.get(calcItem.id)?.attElmt : undefined;

        const attackResult = talentCalc.calcAttackItem(calcItem, elmtEvent, {
          attElmtAlter: itemElmtAlter,
        });

        resultNew[talentType].set(calcItem.name, attackResult);
        continue;
      }

      resultNew[talentType].set(calcItem.name, talentCalc.calcOtherItem(calcItem));
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
        resultNew.EXTRA.set(calcItem.name, extraCalc.calcAttackItem(calcItem, elmtEvent));
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
    resultNew.RXN.set(reaction, calcStandaloneReaction(main, target, reaction, elmtEvent));
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

        resultNew.WP.set(calcItem.name, weaponResult);
        break;
      }
      case "healing":
      case "shield":
      case "other": {
        const otherResult = Object.assign(calcOther(main, type, base), factor);

        resultNew.WP.set(calcItem.name, otherResult);
        break;
      }
      default:
        (type) satisfies never;
    }
  });

  setup.result = resultNew;

  return setup.clone();
}

import type { CalcSetup } from "@/models";
import type { AttackElement } from "@/types";
import type { CalcResultAttackItem } from "../types";
import type { CalcResult } from "./types";

import {
  ATTACK_PATTERNS,
  LUNAR_REACTIONS,
  STELLAR_REACTIONS,
  TRANSFORMATIVE_REACTIONS,
} from "@/constants/global";
import { makeAttackItemCalc } from "../core/makeAttackItemCalc";
import { makeOtherItemCalc } from "../core/makeOtherItemCalc";
import { makeReactionCalc } from "../core/makeReactionCalc";
import { makeTalentCalc } from "../core/makeTalentCalc";
import { ResultRecorder } from "../core/ResultRecorder";
import { applyBuffs } from "./applyBuffs";
import { applyDebuffs } from "./applyDebuffs";
import { getAttackAlters } from "./getAttackAlters";
import { getTalentDefaultValues } from "./getTalentDefaultValues";

type CalculateSetupOptions = {
  shouldLog?: boolean;
  resonatedElmts?: AttackElement[];
};

export function calculateSetup(setup: CalcSetup, options: CalculateSetupOptions = {}) {
  const { main, teammates, calcItems, target } = setup;

  const { calcList } = main.data;
  const { elmtEvent } = setup;

  main.initCalculation();
  target.initCalculation();

  applyBuffs(main, teammates, setup, options);
  applyDebuffs(main, teammates, setup, target);

  target.finalizeCalculation();

  const attackAlters = getAttackAlters(main, setup);

  const result: CalcResult = {
    NAs: {},
    ES: {},
    EB: {},
    XTRA: {},
    RXN: {},
    WP: {},
  };

  const EMPTY_ATTACK_RESULT: CalcResultAttackItem = {
    type: "attack",
    values: [],
    attElmt: "phys",
    attPatt: "none",
    specPatt: null,
    reaction: null,
    recorder: new ResultRecorder(),
  };

  // ===== TALENT CALCULATION =====

  const { polestarProc, polestarCount } = elmtEvent;
  let stellarConductCoefficient = 1;

  if (polestarProc && polestarCount) {
    stellarConductCoefficient += 0.4 + polestarCount * 0.05;
  }

  for (const ATT_PATT of ATTACK_PATTERNS) {
    const talentType = ATT_PATT === "ES" || ATT_PATT === "EB" ? ATT_PATT : "NAs";
    const resultGroup = result[talentType];
    const alterConfig = attackAlters[ATT_PATT];
    const defaultValues = getTalentDefaultValues(main.data, ATT_PATT);

    const calculator = makeTalentCalc(main, target, talentType, defaultValues, alterConfig);

    for (const calcItem of calcList[ATT_PATT]) {
      const { type = "attack", stellar } = calcItem;
      const recorder = new ResultRecorder(
        {
          exclusives: main.attkBonusCtrl.exclusiveGroups(calcItem.id),
        },
        options?.shouldLog,
      );

      if (type === "attack") {
        const itemElmtAlter = calcItem.id ? attackAlters[calcItem.id]?.attElmt : undefined;

        if (alterConfig?.disabled) {
          resultGroup[calcItem.name] = EMPTY_ATTACK_RESULT;
          continue;
        }

        if (calcItem.lunar) {
          resultGroup[calcItem.name] = calculator.calcLunarAttackItem(
            calcItem,
            calcItem.lunar,
            recorder,
          );
          continue;
        }

        if (stellar) {
          let coefficient = 1;

          switch (stellar) {
            case "stellarConduct":
              coefficient = stellarConductCoefficient;
              break;
            case "stellarSwirl":
              coefficient = 1;
              break;
            default:
              stellar satisfies never;
          }

          resultGroup[calcItem.name] = calculator.calcStellarAttackItem(
            calcItem,
            stellar,
            main.data.vision,
            coefficient,
            recorder,
          );
          continue;
        }

        resultGroup[calcItem.name] = calculator.calcAttackItem(
          calcItem,
          itemElmtAlter,
          elmtEvent,
          recorder,
        );
        continue;
      }

      resultGroup[calcItem.name] = calculator.calcOtherItem(type, calcItem, recorder);
    }
  }

  // ===== EXTRA CALCULATION =====

  const extraCalculator = makeTalentCalc(main, target, null, {
    attPatt: "none",
    basedOn: "atk",
    scale: 0,
    flatFactorScale: 3,
  });

  for (const calcItem of calcItems) {
    const { name, type = "attack" } = calcItem;
    const recorder = new ResultRecorder({}, options?.shouldLog);

    if (type === "attack") {
      result.XTRA[name] = extraCalculator.calcAttackItem(calcItem, undefined, elmtEvent, recorder);
    }
  }

  // ===== REACTION CALCULATION =====

  const rxnCalculator = makeReactionCalc(main, target);

  for (const reaction of STELLAR_REACTIONS) {
    const recorder = new ResultRecorder({}, options?.shouldLog);
    result.RXN[reaction] = rxnCalculator.calcStellarReaction(
      reaction,
      elmtEvent.vortexLv,
      recorder,
    );
  }

  for (const reaction of LUNAR_REACTIONS) {
    const recorder = new ResultRecorder({}, options?.shouldLog);
    result.RXN[reaction] = rxnCalculator.calcLunarReaction(reaction, recorder);
  }

  for (const reaction of TRANSFORMATIVE_REACTIONS) {
    const recorder = new ResultRecorder({}, options?.shouldLog);
    result.RXN[reaction] = rxnCalculator.calcReaction(reaction, recorder, elmtEvent);
  }

  // ===== WEAPON CALCULATION =====

  const { weapon } = main;

  weapon.data.calcItems?.forEach((calcItem) => {
    const { name, type = "attack", value, incre = value / 3, basedOn = "atk" } = calcItem;
    const mult = value + incre * weapon.refi;
    const attribute = main.getAttr(basedOn);
    const base = (attribute * mult) / 100;

    const recorder = new ResultRecorder(
      {
        factors: [{ label: basedOn, value: attribute, mult }],
      },
      options?.shouldLog,
    );

    if (type === "attack") {
      result.WP[name] = makeAttackItemCalc(main, target).calculate([base], recorder);
    } else {
      result.WP[name] = makeOtherItemCalc(main).calculate(type, base, recorder);
    }
  });

  setup.result = result;

  return setup;
}

import type { CalcSetup } from "@/models";
import type { CalcResultAttackItem } from "../types";
import type { CalcResult } from "./types";

import { ATTACK_PATTERNS, LUNAR_REACTIONS, TRANSFORMATIVE_REACTIONS } from "@/constants/global";
import { TargetCalc } from "@/models";
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
};

export function calculateSetup(setup: CalcSetup, options: CalculateSetupOptions = {}) {
  const { main, teammates } = setup;
  const target = new TargetCalc(setup.target, setup.target.data, options);

  const { calcList } = main.data;
  const { elmtEvent } = setup;

  main.initCalculation();

  applyBuffs(main, teammates, setup);
  applyDebuffs(main, teammates, setup, target);

  const attackAlters = getAttackAlters(main, setup);

  const result: CalcResult = {
    NAs: {},
    ES: {},
    EB: {},
    RXN: {},
    WP: {},
  };

  const EMPTY_ATTACK_RESULT: CalcResultAttackItem = {
    type: "attack",
    values: [],
    attElmt: "phys",
    attPatt: "none",
    reaction: null,
    recorder: new ResultRecorder(),
  };

  // ===== TALENT CALCULATION =====

  for (const ATT_PATT of ATTACK_PATTERNS) {
    const talentType = ATT_PATT === "ES" || ATT_PATT === "EB" ? ATT_PATT : "NAs";
    const resultGroup = result[talentType];
    const alterConfig = attackAlters[ATT_PATT];
    const defaultValues = getTalentDefaultValues(
      main.data,
      ATT_PATT,
      ATT_PATT === "ES" || ATT_PATT === "EB"
    );

    const calculator = makeTalentCalc(main, target, talentType, defaultValues, alterConfig);

    for (const calcItem of calcList[ATT_PATT]) {
      const { type = "attack" } = calcItem;
      const recorder = new ResultRecorder(
        {
          exclusives: main.attkBonusCtrl.collectExclusiveBonuses(calcItem.id),
        },
        options?.shouldLog
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
            recorder
          );
          continue;
        }

        resultGroup[calcItem.name] = calculator.calcAttackItem(
          calcItem,
          itemElmtAlter,
          elmtEvent,
          recorder
        );
        continue;
      }

      resultGroup[calcItem.name] = calculator.calcOtherItem(type, calcItem, recorder);
    }
  }

  // ===== REACTION CALCULATION =====

  const rxnCalculator = makeReactionCalc(main, target);

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
      options?.shouldLog
    );

    if (type === "attack") {
      result.WP[name] = makeAttackItemCalc(main, target).calculate([base], recorder);
    } else {
      result.WP[name] = makeOtherItemCalc(main).calculate(type, base, recorder);
    }
  });

  return { main, result, target };
}

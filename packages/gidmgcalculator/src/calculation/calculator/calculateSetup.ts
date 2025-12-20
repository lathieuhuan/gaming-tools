import type { CalcSetup } from "@/models/calculator";
import type { AttackPattern } from "@/types";
import type { AttackAlterConfig, CalcResultAttackItem } from "../types";
import type { CalcResult } from "./types";

import {
  ATTACK_PATTERNS,
  LUNAR_REACTIONS,
  NORMAL_ATTACKS,
  TRANSFORMATIVE_REACTIONS,
} from "@/constants/global";
import Array_ from "@/utils/Array";
import { CalcTarget } from "../core/CalcTarget";
import { CharacterCalc } from "../core/CharacterCalc";
import { makeAttackItemCalc } from "../core/makeAttackItemCalc";
import { makeOtherItemCalc } from "../core/makeOtherItemCalc";
import { makeReactionCalc } from "../core/makeReactionCalc";
import { makeTalentCalc } from "../core/makeTalentCalc";
import { ResultRecorder } from "../core/ResultRecorder";
import { applyBuffs } from "./applyBuffs";
import { applyDebuffs } from "./applyDebuffs";
import { getTalentDefaultValues } from "./getTalentDefaultValues";
import { TeammateCalc } from "./TeammateCalc";

type CalculateSetupOptions = {
  shouldRecord?: boolean;
};

export function calculateSetup(setup: CalcSetup, options: CalculateSetupOptions = {}) {
  const main = new CharacterCalc(setup.main, setup.main.data, setup.team, {
    shouldRecord: options.shouldRecord,
  });
  const teammates = setup.teammates.map(
    (teammate) => new TeammateCalc(teammate, teammate.data, setup.team)
  );
  const target = new CalcTarget(setup.target, setup.target.data, options);

  const { calcList } = main.data;
  const { elmtEvent } = setup;

  applyBuffs(main, teammates, setup);
  applyDebuffs(main, teammates, setup, target);

  const attackAlterConfigs = (function getAttackAlterConfigs() {
    const configs: Partial<Record<AttackPattern, AttackAlterConfig>> = {};
    const { buffs } = main.data;

    for (const ctrl of setup.selfBuffCtrls) {
      const buff = ctrl.activated ? Array_.findByIndex(buffs, ctrl.data.index) : undefined;
      const { normalsConfig = [] } = buff || {};

      for (const config of Array_.toArray(normalsConfig)) {
        const { checkInput, forPatt = "ALL", ...rest } = config;

        if (main.isPerformableEffect(config, ctrl.inputs)) {
          if (forPatt === "ALL") {
            for (const type of NORMAL_ATTACKS) {
              configs[type] = rest;
            }
          } else {
            configs[forPatt] = rest;
          }
        }
      }
    }

    return configs;
  })();

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
    const alterConfig = attackAlterConfigs[ATT_PATT];
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
        options?.shouldRecord
      );

      if (type === "attack") {
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

        resultGroup[calcItem.name] = calculator.calcAttackItem(calcItem, elmtEvent, recorder);
        continue;
      }

      resultGroup[calcItem.name] = calculator.calcOtherItem(type, calcItem, recorder);
    }
  }

  // ===== REACTION CALCULATION =====

  const rxnCalculator = makeReactionCalc(main, target);

  for (const reaction of LUNAR_REACTIONS) {
    const recorder = new ResultRecorder({}, options?.shouldRecord);
    result.RXN[reaction] = rxnCalculator.calcLunarReaction(reaction, recorder);
  }

  for (const reaction of TRANSFORMATIVE_REACTIONS) {
    const recorder = new ResultRecorder({}, options?.shouldRecord);
    result.RXN[reaction] = rxnCalculator.calcReaction(reaction, recorder, elmtEvent);
  }

  // ===== WEAPON CALCULATION =====

  const { totalAttrs, weapon } = main;

  weapon.data.calcItems?.forEach((calcItem) => {
    const { name, type = "attack", value, incre = value / 3, basedOn = "atk" } = calcItem;
    const mult = value + incre * weapon.refi;
    const attribute = totalAttrs.get(basedOn);
    const base = (attribute * mult) / 100;

    const recorder = new ResultRecorder(
      {
        factors: [{ label: basedOn, value: attribute, mult }],
      },
      options?.shouldRecord
    );

    if (type === "attack") {
      result.WP[name] = makeAttackItemCalc(main, target).calculate([base], recorder);
    } else {
      result.WP[name] = makeOtherItemCalc(main).calculate(type, base, recorder);
    }
  });

  return { main, result, target };
}

import type { CalcSetup } from "@/models/calculator";
import type { AttackPattern, TalentCalcItemBonusId } from "@/types";
import type { CharacterCalc } from "../core/CharacterCalc";
import type { AttackAlter } from "../types";

import { NORMAL_ATTACKS } from "@/constants";
import Array_ from "@/utils/Array";

export function getAttackAlters(main: CharacterCalc, setup: CalcSetup) {
  const configs: Partial<Record<AttackPattern | TalentCalcItemBonusId, AttackAlter>> = {};
  const { buffs } = main.data;
  setup.team;
  for (const ctrl of setup.selfBuffCtrls) {
    const buff = ctrl.activated ? Array_.findByIndex(buffs, ctrl.data.index) : undefined;
    const { alterConfigs = [] } = buff || {};

    for (const config of Array_.toArray(alterConfigs)) {
      const { checkInput, forPatt = "ALL", attElmt, ...rest } = config;

      if (main.isPerformableEffect(config, ctrl.inputs)) {
        const alter: AttackAlter = {
          ...rest,
          attElmt: attElmt === "phec" ? setup.team.getPhecElmt() : attElmt,
        };

        if (forPatt === "ALL") {
          for (const type of NORMAL_ATTACKS) {
            configs[type] = alter;
          }
        } else {
          for (const id of Array_.toArray(forPatt)) {
            configs[id] = alter;
          }
        }
      }
    }
  }

  return configs;
}

import type { CalcSetup, CharacterCalc } from "@/models/calculation";
import type { AttackPattern, TalentCalcItemBonusId } from "@/types";
import type { AttackAlter } from "../types";

import { NORMAL_ATTACKS } from "@/constants";
import Array_ from "@/utils/Array";

export function getAttackAlters(main: CharacterCalc, setup: CalcSetup) {
  const configs: Partial<Record<AttackPattern | TalentCalcItemBonusId, AttackAlter>> = {};

  for (const ctrl of setup.selfBuffCtrls) {
    if (!ctrl.activated) {
      continue;
    }

    const { alterConfigs = [] } = ctrl.data;

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

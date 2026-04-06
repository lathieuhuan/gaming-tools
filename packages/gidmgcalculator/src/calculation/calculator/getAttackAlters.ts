import { Array_ } from "ron-utils";

import type { CalcSetup, Character } from "@/models";
import type { AttackPattern, TalentCalcItemBonusId } from "@/types";
import type { AttackAlter } from "../types";

import { NORMAL_ATTACKS } from "@/constants";

export function getAttackAlters(main: Character, setup: CalcSetup) {
  const configs: Partial<Record<AttackPattern | TalentCalcItemBonusId, AttackAlter>> = {};

  for (const ctrl of setup.selfBuffCtrls) {
    if (!ctrl.activated) {
      continue;
    }

    const { alterConfigs = [] } = ctrl.data;

    for (const config of Array_.toArray(alterConfigs)) {
      const { checkInput, forPatt = "ALL", attElmt, ...rest } = config;

      if (main.canPerformEffect(config, ctrl.inputs)) {
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

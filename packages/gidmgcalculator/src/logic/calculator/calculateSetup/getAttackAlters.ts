import { Array_ } from "ron-utils";

import type { AttackAlter } from "@/calculation/types";
import type { Character } from "@/models";
import type { AttackPattern, TalentCalcItemBonusId } from "@/types";
import type { CalcSetup } from "../CalcSetup";

import { NORMAL_ATTACKS } from "@/constants";

export function getAttackAlters(main: Character, setup: CalcSetup) {
  const configs: Map<AttackPattern | TalentCalcItemBonusId, AttackAlter> = new Map();

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
            configs.set(type, alter);
          }
        } else {
          for (const id of Array_.toArray(forPatt)) {
            configs.set(id, alter);
          }
        }
      }
    }
  }

  return configs;
}

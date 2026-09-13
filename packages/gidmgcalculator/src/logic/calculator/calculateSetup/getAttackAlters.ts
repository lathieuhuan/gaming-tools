import { Array_ } from "ron-utils";

import type { AttackAlter, AttackPattern, TalentCalcItemBonusId } from "@/types";
import type { CalcSetup } from "../CalcSetup";

import { NORMAL_ATTACKS } from "@/constants";

export function getAttackAlters(setup: CalcSetup) {
  const configs = new Map<AttackPattern | TalentCalcItemBonusId, AttackAlter>();

  for (const ctrl of setup.selfBuffCtrls) {
    if (!ctrl.activated) {
      continue;
    }

    const { alterConfigs = [] } = ctrl.data;

    const mainOps = setup.team.member(setup.main);

    for (const config of Array_.toArray(alterConfigs)) {
      if (!mainOps.canPerformEffect(config, ctrl.inputs)) {
        continue;
      }

      const { checkInput, forPatt = "ALL", attElmt, ...rest } = config;

      const alter: AttackAlter = {
        attElmt: attElmt === "phec" ? setup.team.getPhecElmt() : attElmt,
        ...rest,
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

  return configs;
}

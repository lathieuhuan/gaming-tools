import type { ModifierCtrl } from "@Src/types";
import type { AttackPattern, CharacterBuffNAsConfig } from "../types";

import { findByIndex, toArray } from "@Src/utils";
import { CalculationInfo, EntityCalc } from "../utils";
import { NORMAL_ATTACKS } from "../constants";

export type NormalsConfig = Partial<Record<AttackPattern, Omit<CharacterBuffNAsConfig, "forPatt">>>;

export function getNormalsConfig(info: CalculationInfo, selfBuffCtrls: ModifierCtrl[]) {
  const normalsConfig: NormalsConfig = {};

  for (const ctrl of selfBuffCtrls) {
    const buff = findByIndex(info.appChar.buffs ?? [], ctrl.index);

    if (ctrl.activated && buff?.normalsConfig) {
      for (const config of toArray(buff.normalsConfig)) {
        const { checkInput, forPatt = "ALL", ...rest } = config;

        if (EntityCalc.isApplicableEffect(config, info, ctrl.inputs ?? [], true)) {
          if (forPatt === "ALL") {
            for (const type of NORMAL_ATTACKS) {
              normalsConfig[type] = rest;
            }
          } else {
            normalsConfig[forPatt] = rest;
          }
        }
      }
    }
  }
  return normalsConfig;
}

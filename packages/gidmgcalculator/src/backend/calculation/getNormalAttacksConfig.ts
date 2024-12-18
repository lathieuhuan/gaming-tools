import type { ModifierCtrl } from "@Src/types";
import type { CalculationInfo, NormalAttacksConfig } from "../types";

import Array_ from "@Src/utils/array-utils";
import { NORMAL_ATTACKS } from "../constants";
import { isApplicableEffect } from "../calculation-utils/isApplicableEffect";

export default function getNormalAttacksConfig(selfBuffCtrls: ModifierCtrl[], info: CalculationInfo) {
  const result: NormalAttacksConfig = {};

  for (const ctrl of selfBuffCtrls) {
    const buff = ctrl.activated ? Array_.findByIndex(info.appChar.buffs, ctrl.index) : undefined;
    const { normalsConfig = [] } = buff || {};

    for (const config of Array_.toArray(normalsConfig)) {
      const { checkInput, forPatt = "ALL", ...rest } = config;

      if (isApplicableEffect(config, info, ctrl.inputs ?? [], true)) {
        if (forPatt === "ALL") {
          for (const type of NORMAL_ATTACKS) {
            result[type] = rest;
          }
        } else {
          result[forPatt] = rest;
        }
      }
    }
  }
  return result;
}

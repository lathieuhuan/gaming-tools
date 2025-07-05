import type { ModifierCtrl } from "@Src/types";
import type { AttackAlterConfig, AttackPattern } from "@Src/calculation/types";

import { isApplicableEffect, type CharacterReadData } from "@Src/calculation/common";
import Array_ from "@Src/utils/array-utils";
import { NORMAL_ATTACKS } from "@Src/calculation/constants";

export class AttackAlterer {
  private config: Partial<Record<AttackPattern, AttackAlterConfig>> = {};

  constructor(characterData: CharacterReadData, selfBuffCtrls: ModifierCtrl[]) {
    for (const ctrl of selfBuffCtrls) {
      const buff = ctrl.activated ? Array_.findByIndex(characterData.appCharacter.buffs, ctrl.index) : undefined;
      const { normalsConfig = [] } = buff || {};

      for (const config of Array_.toArray(normalsConfig)) {
        const { checkInput, forPatt = "ALL", ...rest } = config;

        if (isApplicableEffect(config, characterData, ctrl.inputs ?? [], true)) {
          if (forPatt === "ALL") {
            for (const type of NORMAL_ATTACKS) {
              this.config[type] = rest;
            }
          } else {
            this.config[forPatt] = rest;
          }
        }
      }
    }
  }

  getConfig = (attPatt: AttackPattern) => {
    return this.config[attPatt];
  };
}

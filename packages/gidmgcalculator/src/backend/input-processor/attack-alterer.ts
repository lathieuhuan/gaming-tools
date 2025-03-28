import type { ModifierCtrl } from "@Src/types";
import type { AttackAlterConfig, AttackPattern } from "../types";
import { isApplicableEffect, type CharacterData } from "../common-utils";

import Array_ from "@Src/utils/array-utils";
import { NORMAL_ATTACKS } from "../constants";

export class AttackAlterer {
  private config: Partial<Record<AttackPattern, AttackAlterConfig>> = {};

  constructor(characterData: CharacterData, selfBuffCtrls: ModifierCtrl[]) {
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

import type { Target } from "@Src/types";
import type {
  CalculationInfo,
  ElementType,
  EntityDebuff,
  EntityPenaltyTarget,
  ResistanceReduction,
  ResistanceReductionKey,
} from "../types";
import type { TrackerControl } from "./tracker-control";

import { ATTACK_ELEMENTS, ELEMENT_TYPES } from "../constants";
import { ECalcStatModule } from "../constants/internal";
import { toArray } from "@Src/utils";
import { isApplicableEffect } from "../calculation-utils";
import { getPenaltyValue } from "../calculation/getPenaltyValue";

export class ResistanceReductionControl {
  private resistReduct: ResistanceReduction;

  constructor(private info: CalculationInfo, private tracker?: TrackerControl) {
    this.resistReduct = { def: 0 } as ResistanceReduction;

    for (const key of ATTACK_ELEMENTS) {
      this.resistReduct[key] = 0;
    }
  }

  add(key: keyof ResistanceReduction, value: number, description: string) {
    this.resistReduct[key] += value;
    this.tracker?.recordStat(ECalcStatModule.RESIST, key, value, description);
  }

  apply(target: Target) {
    const targetResistances = { def: this.resistReduct.def } as ResistanceReduction;

    for (const key of [...ATTACK_ELEMENTS]) {
      let RES = (target.resistances[key] - this.resistReduct[key]) / 100;
      targetResistances[key] = RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
    }
    return targetResistances;
  }

  private addPenalty = (
    penalty: number,
    targets: EntityPenaltyTarget | EntityPenaltyTarget[],
    inputs: number[],
    description: string
  ) => {
    if (!penalty) return;
    const { info } = this;
    const paths = new Set<ResistanceReductionKey>();

    for (const target of toArray(targets)) {
      if (typeof target === "string") {
        paths.add(target);
        continue;
      }
      switch (target.type) {
        case "inp_elmt": {
          const elmtIndex = inputs[target.inpIndex ?? 0];
          paths.add(ELEMENT_TYPES[elmtIndex]);
          break;
        }
        case "XILONEN": {
          const elmts: ElementType[] = ["pyro", "hydro", "cryo", "electro"];
          let remainingCount = 3;

          for (const teammate of info.partyData.concat(info.appChar)) {
            if (teammate && elmts.includes(teammate.vision)) {
              paths.add(teammate.vision);
              remainingCount--;
            }
          }
          if (remainingCount > 0) paths.add("geo");
          break;
        }
      }
    }
    paths.forEach((path) => this.add(path, penalty, description));
  };

  applyDebuff = (debuff: EntityDebuff, inputs: number[], fromSelf: boolean, description: string) => {
    if (!debuff.effects) return;

    for (const config of toArray(debuff.effects)) {
      const penalty = getPenaltyValue(config, this.info, inputs, fromSelf);

      if (isApplicableEffect(config, this.info, inputs, fromSelf)) {
        this.addPenalty(penalty, config.targets, inputs, description);
      }
    }
  };
}

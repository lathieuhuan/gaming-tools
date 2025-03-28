import type { Target } from "@Src/types";
import type {
  ElementType,
  EntityDebuff,
  EntityPenaltyTarget,
  ResistanceReduction,
  ResistanceReductionKey,
} from "@Src/backend/types";
import type { TrackerControl } from "./tracker-control";

import Array_ from "@Src/utils/array-utils";
import TypeCounter from "@Src/utils/type-counter";
import { isApplicableEffect, type CharacterData } from "@Src/backend/common-utils";
import { ATTACK_ELEMENTS, ELEMENT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { PenaltiesGetter } from "../penalty-getters";

export class ResistanceReductionControl<T extends CharacterData = CharacterData> extends PenaltiesGetter<T> {
  private reductCounter = new TypeCounter<ResistanceReductionKey>();

  constructor(protected characterData: T, private tracker?: TrackerControl) {
    super(characterData);
  }

  add(key: ResistanceReductionKey, value: number, description: string) {
    this.reductCounter.add(key, value);
    this.tracker?.recordStat(ECalcStatModule.RESIST, key, value, description);
  }

  applyTo(target: Target) {
    const targetResistances = { def: this.reductCounter.get("def") } as ResistanceReduction;

    for (const key of ATTACK_ELEMENTS) {
      const RES = (target.resistances[key] - this.reductCounter.get(key)) / 100;
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
    const { characterData } = this;
    const paths = new Set<ResistanceReductionKey>();

    for (const target of Array_.toArray(targets)) {
      if (typeof target === "string") {
        paths.add(target);
        continue;
      }
      switch (target.type) {
        case "INP_ELMT": {
          const elmtIndex = inputs[target.inpIndex ?? 0];
          paths.add(ELEMENT_TYPES[elmtIndex]);
          break;
        }
        case "XILONEN": {
          const elmts: ElementType[] = ["pyro", "hydro", "cryo", "electro"];
          const allElmtCount = characterData.allElmtCount;

          allElmtCount.forEach((elmt) => {
            if (elmts.includes(elmt)) paths.add(elmt);
          });

          if (allElmtCount.get(elmts) < 3) paths.add("geo");
          break;
        }
      }
    }
    paths.forEach((path) => this.add(path, penalty, description));
  };

  applyDebuff = (debuff: EntityDebuff, inputs: number[], fromSelf: boolean, description: string) => {
    if (!debuff.effects) return;

    for (const config of Array_.toArray(debuff.effects)) {
      if (isApplicableEffect(config, this.characterData, inputs, fromSelf)) {
        const penalty = this.getPenaltyValue(config, inputs, fromSelf);

        this.addPenalty(penalty, config.targets, inputs, description);
      }
    }
  };
}

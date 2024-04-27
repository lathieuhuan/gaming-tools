import type { Target } from "@Src/types";
import type { ResistanceReduction } from "@Src/backend/types";
import type { TrackerControl } from "./tracker-control";

import { ATTACK_ELEMENTS } from "@Src/backend/constants";

export class ResistanceReductionControl {
  private resistReduct: ResistanceReduction;
  private tracker?: TrackerControl;

  constructor(tracker?: TrackerControl) {
    this.tracker = tracker;
    this.resistReduct = { def: 0 } as ResistanceReduction;

    for (const key of ATTACK_ELEMENTS) {
      this.resistReduct[key] = 0;
    }
  }

  add(key: keyof ResistanceReduction, value: number, description: string) {
    this.resistReduct[key] += value;
    this.tracker?.recordStat("resistReduct", key, value, description);
  }

  apply(target: Target) {
    const finalResistances = {} as ResistanceReduction;

    for (const key of [...ATTACK_ELEMENTS]) {
      let RES = (target.resistances[key] - this.resistReduct[key]) / 100;
      finalResistances[key] = RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
    }
    return finalResistances;
  }
}

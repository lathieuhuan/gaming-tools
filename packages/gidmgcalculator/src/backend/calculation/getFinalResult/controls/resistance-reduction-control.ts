import type { ResistanceReduction } from "@Src/backend/types";
import type { TrackerControl } from "@Src/backend/calculation/controls";
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
}

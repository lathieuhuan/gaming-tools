import type { Target } from "@Src/types";
import { ResistanceReductionControl, type TrackerControl } from "../controls";

export type GetResistancesArgs = {
  target: Target;
  tracker?: TrackerControl;
};

export default function getResistances({ target, tracker }: GetResistancesArgs) {
  const resistReduct = new ResistanceReductionControl(tracker);

  return resistReduct.apply(target);
}

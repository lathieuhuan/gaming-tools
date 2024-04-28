import type { AppPenaltyTarget, ResistanceReductionKey } from "@Backend/types";
import type { DebuffInfoWrap } from "./getFinalResult.types";
import { toArray } from "@Src/utils";
import { ELEMENT_TYPES } from "@Src/backend/constants";

type ApplyPenaltyArgs = {
  penaltyValue: number;
  targets: AppPenaltyTarget | AppPenaltyTarget[];
  inputs: number[];
  description: string;
  info: DebuffInfoWrap;
};
export function applyPenalty(args: ApplyPenaltyArgs) {
  if (!args.penaltyValue) return;

  for (const target of toArray(args.targets)) {
    let path: ResistanceReductionKey;

    if (typeof target === "string") {
      path = target;
    } else {
      const elmtIndex = args.inputs[target.inpIndex ?? 0];
      path = ELEMENT_TYPES[elmtIndex];
    }

    args.info.resistReduct.add(path, args.penaltyValue, args.description);
  }
}

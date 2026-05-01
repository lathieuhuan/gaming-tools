import { BonusCoreSpec, BonusSpec } from "@/types";
import { Array_, Object_ } from "ron-utils";

function isDynamic(spec?: number | BonusCoreSpec) {
  return Object_.isObject(spec) && spec.basedOn !== undefined;
}

export function isDynamicBonusSpec(spec: BonusSpec) {
  return (
    isDynamic(spec) ||
    isDynamic(spec.preExtra) ||
    (spec.extras !== undefined && Array_.toArray(spec.extras).some(isDynamic))
    // TODO check if we can remove number type from extras
  );
}

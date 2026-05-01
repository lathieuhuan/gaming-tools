import { Array_ } from "ron-utils";

import type { BonusSpec } from "@/types";
import type { MemberCan } from "./memberCan";

import { isDynamicBonusSpec } from "./isDynamicBonusSpec";

export function categorizeBonusSpecs(specs: BonusSpec | BonusSpec[], memberCan: MemberCan) {
  const tltSpecs: BonusSpec[] = [];
  const fiSpecs: BonusSpec[] = [];
  const dyAttrSpecs: BonusSpec[] = [];
  const dyAttkSpecs: BonusSpec[] = [];

  for (const spec of Array_.toArray(specs)) {
    if (!memberCan.performEffect(spec)) {
      continue;
    }

    switch (spec.target.module) {
      case "TLT": {
        tltSpecs.push(spec);
        break;
      }
      case "ATTR": {
        if (isDynamicBonusSpec(spec)) {
          dyAttrSpecs.push(spec);
        } else {
          fiSpecs.push(spec);
        }
        break;
      }
      default: {
        if (isDynamicBonusSpec(spec)) {
          dyAttkSpecs.push(spec);
        } else {
          fiSpecs.push(spec);
        }
        break;
      }
    }
  }

  if (
    !tltSpecs.length &&
    !fiSpecs.length &&
    !dyAttrSpecs.length &&
    !dyAttkSpecs.length
  ) {
    return null;
  }

  return {
    fiSpecs: [...tltSpecs, ...fiSpecs],
    dyAttrSpecs,
    dyAttkSpecs,
    rearrange() {
      return [...tltSpecs, ...fiSpecs, ...dyAttrSpecs, ...dyAttkSpecs];
    },
  };
}

import { Array_ } from "ron-utils";

import type { BonusSpec } from "@/types";
import type { MemberCan } from "./memberCan";

export function categorizeBonusSpecs(specs: BonusSpec | BonusSpec[], memberCan: MemberCan) {
  const tltSpecs: BonusSpec[] = [];
  const attrSpecs: BonusSpec[] = [];
  const attkSpecs: BonusSpec[] = [];

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
        attrSpecs.push(spec);
        break;
      }
      default: {
        attkSpecs.push(spec);
        break;
      }
    }
  }

  if (!tltSpecs.length && !attrSpecs.length && !attkSpecs.length) {
    return null;
  }

  return {
    tltSpecs,
    attrSpecs,
    attkSpecs,
    rearrange() {
      return [...tltSpecs, ...attrSpecs, ...attkSpecs];
    },
  };
}

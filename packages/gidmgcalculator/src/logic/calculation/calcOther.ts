import { toMult } from "ron-utils";

import type { Character } from "@/models";
import type { CalcItemType, TalentCalcItemBonusId } from "@/types";
import type { CalcOtherOutputs } from "./types";

type CalcOtherInputs = {
  itemId?: TalentCalcItemBonusId;
  flatBonus?: number;
};

export function calcOther(
  performer: Character,
  type: Exclude<CalcItemType, "attack">,
  base: number,
  inputs: CalcOtherInputs,
): CalcOtherOutputs {
  const { attkBonusCtrl } = performer;
  const { itemId } = inputs;

  const baseMult = toMult(attkBonusCtrl.get("baseMult_", [itemId]));

  let flat = inputs.flatBonus || 0;
  let bonusMult = attkBonusCtrl.get("pct_", [itemId]);
  let inhealMult = 1;

  switch (type) {
    case "healing":
      flat += attkBonusCtrl.get("flat", [itemId]);
      bonusMult += performer.getAttr("healB_");
      inhealMult = toMult(performer.getAttr("inHealB_"));
      break;
    case "shield":
      bonusMult += performer.getAttr("shieldS_");
      break;
    case "other":
      // currently no other items
      break;
    default: {
      (type) satisfies never;
    }
  }

  bonusMult = toMult(bonusMult);

  return {
    type,
    baseMult,
    flat,
    bonusMult,
    result: (base * baseMult + flat) * bonusMult * inhealMult,
  };
}

import type { CharacterCalc } from "@/models/calculation";
import type { TalentCalcItemBonusId } from "@/types";
import type { CalcResultOtherItem } from "../types";
import type { ResultRecorder } from "./ResultRecorder";

import { toMult } from "@/utils";

export function makeOtherItemCalc(performer: CharacterCalc) {
  const { allAttrs, attkBonusCtrl } = performer;

  function calculate(
    type: CalcResultOtherItem["type"],
    base: number,
    recorder: ResultRecorder,
    flat = 0,
    itemId?: TalentCalcItemBonusId
  ): CalcResultOtherItem {
    let bonusMult = attkBonusCtrl.get("pct_", itemId);

    switch (type) {
      case "healing":
        flat = attkBonusCtrl.get("flat", itemId);
        bonusMult += allAttrs.get("healB_");
        break;
      case "shield":
        bonusMult += allAttrs.get("shieldS_");
        break;
    }

    bonusMult = toMult(bonusMult);
    const specMult = toMult(attkBonusCtrl.get("specMult_", itemId));

    base = (base + flat) * bonusMult * specMult;

    recorder.record({
      flat,
      bonusMult,
      specMult,
    });

    return {
      exclusiveBonusId: itemId,
      type,
      values: [{ base, crit: 0, average: base }],
      recorder,
    };
  }

  return {
    calculate,
  };
}

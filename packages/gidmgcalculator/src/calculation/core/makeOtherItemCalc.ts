import { toMult } from "ron-utils";

import type { Character } from "@/models";
import type { TalentCalcItemBonusId } from "@/types";
import type { CalcResultOtherItem } from "../types";
import type { ResultRecorder } from "./ResultRecorder";

export function makeOtherItemCalc(performer: Character) {
  const { attkBonusCtrl } = performer;

  function calculate(
    type: CalcResultOtherItem["type"],
    base: number,
    recorder: ResultRecorder,
    flat = 0,
    itemId?: TalentCalcItemBonusId
  ): CalcResultOtherItem {
    const baseMult = toMult(attkBonusCtrl.get("baseMult_", [itemId]));
    let bonusMult = attkBonusCtrl.get("pct_", [itemId]);

    switch (type) {
      case "healing":
        flat += attkBonusCtrl.get("flat", [itemId]);
        bonusMult += performer.getAttr("healB_");
        break;
      case "shield":
        bonusMult += performer.getAttr("shieldS_");
        break;
    }

    bonusMult = toMult(bonusMult);
    const specMult = toMult(attkBonusCtrl.get("specMult_", [itemId]));

    base = (base * baseMult + flat) * bonusMult * specMult;

    recorder.record({
      flat,
      baseMult,
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

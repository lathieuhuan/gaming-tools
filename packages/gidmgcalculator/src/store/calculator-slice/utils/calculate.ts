import { calculateSetup } from "@Calculation";
import { message } from "rond";

import type { CalculatorState } from "../calculator-slice.types";

export function calculate(state: CalculatorState, all?: boolean) {
  try {
    const { activeId, setupManageInfos, setupsById, target } = state;
    const allIds = all ? setupManageInfos.map(({ ID }) => ID) : [activeId];

    for (const id of allIds) {
      const result = calculateSetup(setupsById[id], target);

      state.resultById[id] = {
        totalAttr: result.totalAttr,
        attkBonuses: result.attkBonuses,
        finalResult: result.finalResult,
      };
    }
  } catch (err) {
    console.log(err);
    message.error("An unknown error has occurred and prevented the calculation process.");
  }
}

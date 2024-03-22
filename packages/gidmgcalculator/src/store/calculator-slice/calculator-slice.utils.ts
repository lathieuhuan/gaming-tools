import type { CalculatorState } from "./calculator-slice.types";
import { $AppCharacter } from "@Src/services";
import { calculateSetup } from "@Src/calculation";

export function getCharDataFromState(state: CalculatorState) {
  const setup = state.setupsById[state.activeId];
  return $AppCharacter.get(setup.char.name);
}

export function calculate(state: CalculatorState, all?: boolean) {
  try {
    const { activeId, setupManageInfos, setupsById, target } = state;
    const allIds = all ? setupManageInfos.map(({ ID }) => ID) : [activeId];

    for (const id of allIds) {
      const result = calculateSetup(setupsById[id], target);
      state.resultById[id] = {
        infusedElement: result.infusedElement,
        totalAttrs: result.totalAttr,
        rxnBonuses: result.rxnBonus,
        finalResult: result.finalResult,
      };
    }
  } catch (err) {
    console.log(err);

    state.message = {
      active: true,
      type: "error",
      content: "An unknown error has occurred and prevented the calculation process.",
    };
  }
}

import { message } from "rond";
import { AppCharacter, calculateSetup, ElementType } from "@Calculation";

import type { Party } from "@Src/types";
import type { CalculatorState } from "./calculator-slice.types";
import { $AppCharacter } from "@Src/services";
import TypeCounter from "@Src/utils/type-counter";

export function getAppCharacterFromState(state: CalculatorState) {
  const setup = state.setupsById[state.activeId];
  return $AppCharacter.get(setup.char.name);
}

export function countAllElements(appCharacter: AppCharacter, party: Party) {
  const count = new TypeCounter<ElementType>();

  count.add(appCharacter.vision);

  for (const teammate of party) {
    if (teammate) count.add($AppCharacter.get(teammate.name).vision);
  }
  return count;
}

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

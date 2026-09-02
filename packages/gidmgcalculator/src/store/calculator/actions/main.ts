import type { CalcSetup, CalcSetupActions } from "@/logic/calculator";
import type { Target } from "@/models";
import type { RawCharacterState } from "@/types";
import type { WritableDraft } from "immer/dist/internal.js";
import type { CalculatorState } from "../types";

import { useSettingsStore } from "@Store/settings";
import { useCalcStore } from "../calculatorStore";

/**
 * @param id Default activeId
 */
export const updateSetup = (
  callback: (
    setup: WritableDraft<CalcSetup>,
    state: WritableDraft<CalculatorState>,
  ) => boolean | void,
  id?: number,
) => {
  useCalcStore.setState((state) => {
    const setupId = id ?? state.activeId;
    const setup = state.setupsById[setupId];

    if (setup) {
      const shouldCalculate = callback(setup, state) ?? true;

      if (shouldCalculate) {
        state.setupsById[setupId] = setup.calculate();
      }
    } else {
      console.error(`Setup with id ${setupId} not found`);
    }
  });
};

export const updateMain = (data: Partial<RawCharacterState>, setupIds?: number[]) => {
  const { separateCharInfo } = useSettingsStore.getState();

  useCalcStore.setState((state) => {
    const { setupsById } = state;

    setupIds ||= separateCharInfo ? [state.activeId] : state.setupManagers.map(({ ID }) => ID);

    for (const setupId of setupIds) {
      const setup = setupsById[setupId];

      setup.updateMainState(data);
      setupsById[setupId] = setup.calculate();
    }
  });
};

export const updateElementalEvent: CalcSetupActions["updateElementalEvent"] = (data) => {
  updateSetup((setup) => {
    setup.updateElementalEvent(data);
  });
};

export const setTarget = (target: Target) => {
  useCalcStore.setState((state) => {
    const { setupsById } = state;

    state.target = target;

    for (const { ID } of state.setupManagers) {
      setupsById[ID].target = target.clone();
      setupsById[ID] = setupsById[ID].calculate();
    }
  });
};

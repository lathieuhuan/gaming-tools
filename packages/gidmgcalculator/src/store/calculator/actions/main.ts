import type { Target } from "@/models";
import type { RawCharacterState } from "@/types";

import { CalcSetupActions } from "@/logic/calculator";
import { useSettingsStore } from "@Store/settings";
import { useCalcStore } from "../calculatorStore";
import { updateSetup } from "./setup";

// ===== CHARACTER =====

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

// ===== ELEMENTAL EVENT =====

export const updateElementalEvent: CalcSetupActions["updateElementalEvent"] = (data) => {
  updateSetup((setup) => {
    setup.updateElementalEvent(data);
  });
};

// ===== TARGET =====

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

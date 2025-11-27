import type { CalculatorState } from "../types";

import Array_ from "@/utils/Array";
import { useCalcStore } from "../calculator-store";
import { getCopyName } from "../utils";

export * from "./main";
export * from "./teammate";
export * from "./modifier";

export const updateCalculator = (
  data: Partial<Pick<CalculatorState, "activeId" | "standardId" | "comparedIds">>
) => {
  useCalcStore.setState((state) => {
    state.activeId = data.activeId ?? state.activeId;
    state.standardId = data.standardId ?? state.standardId;
    state.comparedIds = data.comparedIds ?? state.comparedIds;
  });
};

export const duplicateSetup = (sourceId: number) => {
  useCalcStore.setState((state) => {
    const { comparedIds, setupManagers, setupsById } = state;

    if (setupsById[sourceId]) {
      const setupID = Date.now();
      let setupName = Array_.findById(setupManagers, sourceId)?.name;

      if (setupName) {
        setupName = getCopyName(setupName, setupManagers);
      }

      setupManagers.push({
        ID: setupID,
        name: setupName || "New Setup",
        type: "original",
      });
      setupsById[setupID] = setupsById[sourceId].clone({ ID: setupID }).calculate();

      if (comparedIds.includes(sourceId)) {
        state.comparedIds.push(setupID);
      }
    }
  });
};

export const removeSetup = (removeId: number) => {
  useCalcStore.setState((state) => {
    if (state.setupManagers.length > 1) {
      //
      state.setupManagers = state.setupManagers.filter((manager) => manager.ID !== removeId);
      delete state.setupsById[removeId];

      if (removeId === state.activeId) {
        state.activeId = state.setupManagers[0].ID;
      }

      state.comparedIds = state.comparedIds.filter((ID) => ID !== removeId);

      if (state.comparedIds.length === 1) {
        state.comparedIds = [];
      }
      if (removeId === state.standardId && state.comparedIds.length) {
        state.standardId = state.comparedIds[0];
      }
    }
  });
};

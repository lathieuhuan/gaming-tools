import type { CalculatorState } from "./types";

export function selectSetup(state: CalculatorState, id = state.activeId) {
  return state.setupsById[id];
}

export function selectSetupManager(state: CalculatorState, id = state.activeId) {
  return state.setupManagers.find((manager) => manager.ID === id);
}

export function selectActiveMain(state: CalculatorState) {
  return selectSetup(state).main;
}
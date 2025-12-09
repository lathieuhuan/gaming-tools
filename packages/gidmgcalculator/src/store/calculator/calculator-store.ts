import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/shallow";

import type{ CalculatorState } from "./types";

import { createTarget } from "@/utils/Entity";

export const initialState: CalculatorState = {
  activeId: 0,
  standardId: 0,
  comparedIds: [],
  setupManagers: [],
  setupsById: {},
  target: createTarget({ code: 0 }),
};

export const useCalcStore = create<CalculatorState>()(immer(() => initialState));

export const useShallowCalcStore = <T>(selector: (state: CalculatorState) => T) => {
  return useCalcStore(useShallow(selector));
};

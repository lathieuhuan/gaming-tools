import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/shallow";

import { MainTarget } from "@/models/calculator";
import { CalculatorState } from "./types";

export const initialState: CalculatorState = {
  activeId: 0,
  standardId: 0,
  comparedIds: [],
  setupManagers: [],
  setupsById: {},
  target: MainTarget.DEFAULT(),
};

export const useCalcStore = create<CalculatorState>()(immer(() => initialState));

export const useShallowCalcStore = <T>(selector: (state: CalculatorState) => T) => {
  return useCalcStore(useShallow(selector));
};

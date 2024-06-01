import { createSlice } from "@reduxjs/toolkit";
import type { SimulatorState } from "./simulator-slice.types";

const initialState: SimulatorState = {
  activeId: 0,
  simulationManageInfos: [],
  simulationsById: {},
};

export const simulatorSlice = createSlice({
  name: "calculator",
  initialState,
  reducers: {
    addSimulation: (state, action) => {
      //
    },
  },
});

export const {
  addSimulation
} = simulatorSlice.actions;

export default simulatorSlice.reducer;

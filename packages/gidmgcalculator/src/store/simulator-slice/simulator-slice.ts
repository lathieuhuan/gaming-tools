import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Simulation } from "@Src/types";
import type { SimulatorState } from "./simulator-slice.types";

const initialState: SimulatorState = {
  active: {
    simulationId: 0,
    member: "",
  },
  simulationManageInfos: [],
  simulationsById: {},
};

export const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    addSimulation: (state, action: PayloadAction<Simulation>) => {
      const id = Date.now();

      state.active = {
        simulationId: id,
        member: action.payload.members[0].name,
      };
      state.simulationManageInfos.push({
        id,
        name: "Simulation 1",
      });
      state.simulationsById[id] = action.payload;
    },
  },
});

export const { addSimulation } = simulatorSlice.actions;

export default simulatorSlice.reducer;

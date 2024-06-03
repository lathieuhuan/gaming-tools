import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AddSimulationPayload, SimulatorState } from "./simulator-slice.types";
import { Setup_ } from "@Src/utils";
import { $AppSettings } from "@Src/services";

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
    addSimulation: (state, action: AddSimulationPayload) => {
      const id = Date.now();
      const {
        members,
        triggerEvents = [],
        actionEvents = [],
        target = Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
      } = action.payload;

      state.active = {
        simulationId: id,
        member: members[0].name,
      };
      state.simulationManageInfos.push({
        id,
        name: "Simulation 1",
      });
      state.simulationsById[id] = {
        members,
        triggerEvents,
        actionEvents,
        target,
      };
    },
  },
});

export const { addSimulation } = simulatorSlice.actions;

export default simulatorSlice.reducer;

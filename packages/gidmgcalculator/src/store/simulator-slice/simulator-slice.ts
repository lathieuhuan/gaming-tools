import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AddSimulationPayload, SimulatorState } from "./simulator-slice.types";
import { Setup_ } from "@Src/utils";
import { $AppSettings } from "@Src/services";
import { SimulationEvent } from "@Src/types";
import { getSimulation } from "./simulator-slice.utils";

const initialState: SimulatorState = {
  activeId: 0,
  activeMember: "",
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
        events = [],
        target = Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
      } = action.payload;

      if (members) {
        state.activeId = id;
        state.activeMember = members[0].name;
        state.simulationManageInfos.push({
          id,
          name: "Simulation 1",
        });
        state.simulationsById[id] = {
          members,
          events,
          target,
        };
      }
    },
    addEvent: (state, action: PayloadAction<SimulationEvent>) => {
      getSimulation(state)?.events.push(action.payload);
    },
  },
});

export const { addSimulation, addEvent } = simulatorSlice.actions;

export default simulatorSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { HitEvent, ModifyEvent } from "@Src/types";
import type { AddSimulationPayload, SimulatorState } from "./simulator-slice.types";
import { Setup_ } from "@Src/utils";
import { $AppSettings } from "@Src/services";
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
    addEvent: (state, action: PayloadAction<Omit<ModifyEvent, "id"> | Omit<HitEvent, "id">>) => {
      const events = getSimulation(state)?.events;

      if (events) {
        let id: number;

        if (events.length <= 1) {
          id = events.length;
        } else {
          let current = events[0];

          for (const event of events) {
            if (event.id - current.id > 1) {
              break;
            } else {
              current = event;
            }
          }
          id = current.id + 1;
        }
        events.push({ id, ...action.payload });
      }
    },
  },
});

export const { addSimulation, addEvent } = simulatorSlice.actions;

export default simulatorSlice.reducer;

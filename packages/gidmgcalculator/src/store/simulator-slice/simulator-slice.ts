import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AddEventPayload, AddSimulationPayload, SimulatorState } from "./simulator-slice.types";
import { Setup_, removeEmpty, uuid } from "@Src/utils";
import { $AppCharacter, $AppSettings } from "@Src/services";
import { getNextEventId, getSimulation } from "./simulator-slice.utils";

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
      const { members, target = Setup_.createTarget({ level: $AppSettings.get("targetLevel") }) } = action.payload;

      if (members) {
        const initialChunk = {
          id: uuid(),
          ownerCode: $AppCharacter.get(members[0].name).code,
          events: [],
        };
        const { chunks = [initialChunk] } = action.payload;

        state.activeId = id;
        state.activeMember = members[0].name;
        state.simulationManageInfos.push({
          id,
          name: "Simulation 1",
        });
        state.simulationsById[id] = {
          members,
          chunks,
          target,
        };
      }
    },
    addEvent: (state, action: AddEventPayload) => {
      const chunks = getSimulation(state)?.chunks;

      if (chunks) {
        const { alsoSwitch, ...rest } = action.payload;
        const lastChunk = chunks[chunks.length - 1];
        const event = Object.assign(structuredClone(removeEmpty(rest)), {
          id: getNextEventId(chunks),
        });
        const performerCode = event.performer.code;

        if (alsoSwitch && lastChunk.ownerCode !== performerCode) {
          chunks.push({
            id: uuid(),
            ownerCode: performerCode,
            events: [event],
          });
        } else {
          lastChunk.events.push(event);
        }
      }
    },
    changeActiveMember: (state, action: PayloadAction<string>) => {
      state.activeMember = action.payload;
    },
    changeOnFieldMember: (state, action: PayloadAction<number>) => {
      const simulation = getSimulation(state);

      simulation?.chunks.push({
        id: uuid(),
        ownerCode: action.payload,
        events: [],
      });
    },
  },
});

export const { addSimulation, addEvent, changeActiveMember, changeOnFieldMember } = simulatorSlice.actions;

export default simulatorSlice.reducer;

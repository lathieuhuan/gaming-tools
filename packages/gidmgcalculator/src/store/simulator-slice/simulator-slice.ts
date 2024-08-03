import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { SimulationMember } from "@Src/types";
import type { AddEventPayload, CreateSimulationPayload, SimulatorState } from "./simulator-slice.types";
import { Setup_, removeEmpty, uuid } from "@Src/utils";
import { $AppCharacter, $AppSettings } from "@Src/services";
import { _addEvent, getNextEventId, getSimulation } from "./simulator-slice.utils";

const initialState: SimulatorState = {
  activeId: 0,
  activeMember: 0,
  simulationManageInfos: [],
  simulationsById: {},
  pendingMembers: [],
};

export const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    updatePendingMembers: (state, action: PayloadAction<(SimulationMember | null)[]>) => {
      state.pendingMembers = action.payload;
    },
    updatePendingMember: (state, action: PayloadAction<{ at: number; config: Partial<SimulationMember> | null }>) => {
      const { at, config } = action.payload;

      state.pendingMembers = state.pendingMembers.map((member, index) =>
        member && config ? (index === at ? { ...member, ...config } : member) : null
      );
    },
    createSimulation: (state, action: CreateSimulationPayload) => {
      const id = Date.now();
      const {
        name,
        members,
        target = Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
      } = action.payload;

      if (members) {
        const ownerCode = $AppCharacter.get(members[0].name).code;

        const initialChunk = {
          id: uuid(),
          ownerCode,
          events: [],
        };
        const { chunks = [initialChunk] } = action.payload;

        state.activeId = id;
        state.activeMember = ownerCode;
        state.simulationManageInfos.push({
          id,
          name,
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
        const { alsoSwitch = false, ...eventProps } = action.payload;
        const event = Object.assign(structuredClone(removeEmpty(eventProps)), {
          id: getNextEventId(chunks),
        });
        const performerCode = event.performer.code;

        _addEvent(chunks, event, performerCode, alsoSwitch);
      }
    },
    changeActiveMember: (state, action: PayloadAction<number>) => {
      state.activeMember = action.payload;
    },
    changeOnFieldMember: (state, action: PayloadAction<number>) => {
      const chunks = getSimulation(state)?.chunks;

      if (chunks) {
        _addEvent(chunks, null, action.payload, true);
      }
    },
  },
});

export const {
  updatePendingMembers,
  updatePendingMember,
  createSimulation,
  addEvent,
  changeActiveMember,
  changeOnFieldMember,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;

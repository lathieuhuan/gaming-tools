import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { SimulationMember } from "@Src/types";
import type {
  AddEventPayload,
  CreateSimulationPayload,
  PendingSimulation,
  SimulatorState,
  UpdateSimulatorPayload,
} from "./simulator-slice.types";
import { Setup_, removeEmpty, uuid } from "@Src/utils";
import { $AppCharacter, $AppSettings } from "@Src/services";
import { _addEvent, getNextEventId, getSimulation } from "./simulator-slice.utils";

const initialState: SimulatorState = {
  stage: "WAITING",
  pendingSimulation: {
    name: "",
    members: [],
  },
  activeId: 0,
  activeMember: 0,
  simulations: [],
};

export const DEFAULT_SIMULATION_NAME = "New Simulation";

export const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    updateSimulator: (state, action: UpdateSimulatorPayload) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    prepareSimulation: (state, action: PayloadAction<Partial<PendingSimulation> | undefined>) => {
      const { name = DEFAULT_SIMULATION_NAME, members = [null, null, null, null] } = action.payload || {};

      state.stage = "PREPARING";
      state.pendingSimulation = {
        name,
        members,
      };
    },
    cancelPendingSimulation: (state) => {
      state.stage = state.activeId ? "RUNNING" : "WAITING";
      state.pendingSimulation = initialState.pendingSimulation;
    },
    updatePendingSimulationName: (state, action: PayloadAction<string>) => {
      state.pendingSimulation.name = action.payload;
    },
    updatePendingMembers: (state, action: PayloadAction<(SimulationMember | null)[]>) => {
      state.pendingSimulation.members = action.payload;
    },
    updatePendingMember: (state, action: PayloadAction<{ at: number; config: Partial<SimulationMember> | null }>) => {
      const { at, config } = action.payload;

      state.pendingSimulation.members = state.pendingSimulation.members.map((member, index) =>
        index === at ? (member && config ? { ...member, ...config } : null) : member
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
        state.simulations.unshift({
          id,
          name,
          members,
          chunks,
          target,
        });

        state.stage = "RUNNING";
        state.pendingSimulation = initialState.pendingSimulation;
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
    changeOnFieldMember: (state, action: PayloadAction<number>) => {
      const chunks = getSimulation(state)?.chunks;

      if (chunks) {
        _addEvent(chunks, null, action.payload, true);
      }
    },
  },
});

export const {
  updateSimulator,
  prepareSimulation,
  cancelPendingSimulation,
  updatePendingSimulationName,
  updatePendingMembers,
  updatePendingMember,
  createSimulation,
  addEvent,
  changeOnFieldMember,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;

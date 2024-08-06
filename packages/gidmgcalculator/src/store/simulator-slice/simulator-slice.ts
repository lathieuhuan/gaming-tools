import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Simulation, SimulationChunk, SimulationMember } from "@Src/types";
import type {
  AddEventPayload,
  AssembledSimulation,
  SimulatorState,
  UpdateAssembledSimulationPayload,
  UpdateSimulatorPayload,
} from "./simulator-slice.types";
import { Setup_, removeEmpty, uuid } from "@Src/utils";
import { $AppCharacter, $AppSettings } from "@Src/services";
import { _addEvent, fillAssembledMembers, getNextEventId, getSimulation } from "./simulator-slice.utils";

const initialState: SimulatorState = {
  stage: "WAITING",
  assembledSimulation: {
    id: 0,
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
      const { assembledSimulation } = action.payload;

      if (assembledSimulation) {
        const processedSimulation: AssembledSimulation = {
          ...assembledSimulation,
          members: fillAssembledMembers(assembledSimulation.members),
        };
        return {
          ...state,
          ...action.payload,
          assembledSimulation: processedSimulation,
        };
      }
      return {
        ...state,
        ...action.payload,
      };
    },
    startAssembledSimulation: (state, action: PayloadAction<Partial<AssembledSimulation> | undefined>) => {
      const { id = Date.now(), name = DEFAULT_SIMULATION_NAME, members = [], ...others } = action.payload || {};

      state.stage = "ASSEMBLING";
      state.assembledSimulation = {
        id,
        name,
        members: fillAssembledMembers(members),
        ...others,
      };
    },
    cancelAssembledSimulation: (state) => {
      state.stage = state.activeId ? "RUNNING" : "WAITING";
      state.assembledSimulation = initialState.assembledSimulation;
    },
    updateAssembledSimulation: (state, action: UpdateAssembledSimulationPayload) => {
      Object.assign(state.assembledSimulation, action.payload);
    },
    updateAssembledMember: (state, action: PayloadAction<{ at: number; config: Partial<SimulationMember> | null }>) => {
      const { at, config } = action.payload;

      state.assembledSimulation.members = state.assembledSimulation.members.map((member, index) =>
        index === at ? (member && config ? { ...member, ...config } : null) : member
      );
    },
    completeAssembledSimulation: (state) => {
      // 3 cases: CREATE NEW, UPDATE EXISTING, DUPLICATE EXISTING
      const members = state.assembledSimulation.members.reduce(
        (members: SimulationMember[], member) => (member ? members.concat(member) : members),
        []
      );

      if (members.length) {
        const activeMember = $AppCharacter.get(members[0].name).code;
        const initialChunk: SimulationChunk = {
          id: uuid(),
          ownerCode: activeMember,
          events: [],
        };
        const {
          id,
          name,
          chunks = [initialChunk],
          target = Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
        } = state.assembledSimulation;

        const completedSimulation: Simulation = {
          id,
          name,
          members,
          chunks,
          target,
        };
        const existedIndex = state.simulations.findIndex((simulation) => simulation.id === id);

        if (existedIndex !== -1) {
          // Give updated simulation new id so everything will be re-calculated (safest way)
          completedSimulation.id = Date.now();

          state.simulations[existedIndex] = completedSimulation;
        } else {
          state.simulations.unshift(completedSimulation);
        }

        state.activeId = completedSimulation.id;
        state.activeMember = activeMember;
        state.stage = "RUNNING";
        state.assembledSimulation = initialState.assembledSimulation;
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
  startAssembledSimulation,
  cancelAssembledSimulation,
  updateAssembledSimulation,
  updateAssembledMember,
  completeAssembledSimulation,
  addEvent,
  changeOnFieldMember,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Simulation, SimulationChunk, SimulationMember } from "@Src/types";
import type {
  AddEventPayload,
  AssembledSimulation,
  RemoveEventPayload,
  SimulatorState,
  UpdateAssembledSimulationPayload,
  UpdateSimulatorPayload,
} from "./simulator-slice.types";
import { Setup_, removeEmpty, uuid } from "@Src/utils";
import { $AppCharacter, $AppSettings } from "@Src/services";
import { fillAssembledMembers, getNextEventId, getSimulation } from "./simulator-slice.utils";

const initialState: SimulatorState = {
  stage: "WAITING",
  assembledSimulation: {
    id: 0,
    name: "",
    timeOn: false,
    members: [],
  },
  activeId: 0,
  activeMember: 0,
  activeChunkId: "",
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
      const {
        id = Date.now(),
        name = DEFAULT_SIMULATION_NAME,
        timeOn = false,
        members = [],
        ...others
      } = action.payload || {};

      state.stage = "ASSEMBLING";
      state.assembledSimulation = {
        id,
        name,
        timeOn,
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
          chunks = [initialChunk],
          target = Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
          ...restAssembledProps
        } = state.assembledSimulation;

        const completedSimulation: Simulation = {
          id,
          chunks,
          target,
          ...restAssembledProps,
          members,
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
      const simulation = getSimulation(state);
      const chunks = simulation?.chunks ?? [];
      const lastChunk = chunks.at(-1);

      if (simulation && lastChunk) {
        const { alsoSwitch = false, ...eventProps } = action.payload;
        const event = Object.assign(structuredClone(removeEmpty(eventProps)), {
          id: getNextEventId(chunks),
        });

        switch (event.type) {
          case "SYSTEM_MODIFY":
            lastChunk.events.push(event);
            break;
          default:
            if (alsoSwitch && lastChunk.ownerCode !== event.performer.code) {
              let removedId: string | undefined;

              if (!lastChunk.events.length) {
                removedId = chunks.pop()?.id;
              }

              chunks.push({
                id: removedId ?? uuid(),
                ownerCode: event.performer.code,
                events: [event],
              });
            } else {
              lastChunk.events.push(event);
            }
        }
      }
    },
    changeOnFieldMember: (state, action: PayloadAction<number>) => {
      const chunks = getSimulation(state)?.chunks ?? [];
      const lastChunk = chunks.at(-1);
      const newOnfieldMemberCode = action.payload;

      if (lastChunk && lastChunk.ownerCode !== newOnfieldMemberCode) {
        let removedId: string | undefined;

        if (!lastChunk.events.length) {
          removedId = chunks.pop()?.id;
        }

        chunks.push({
          id: removedId ?? uuid(),
          ownerCode: newOnfieldMemberCode,
          events: [],
        });
      }
    },
    removeEvent: (state, action: RemoveEventPayload) => {
      const { chunkId, eventId } = action.payload;
      const chunks = getSimulation(state)?.chunks ?? [];
      const chunkIndex = chunks.findIndex((chunk) => chunk.id === chunkId);

      if (chunkIndex !== -1) {
        const chunk = chunks[chunkIndex];

        chunk.events = chunk.events.filter((event) => event.id !== eventId);

        // If chunk is empty AND (not the first chunk OR there's still atleast a chunk left)
        if (!chunk.events.length && (chunkIndex || chunks.length > 1)) {
          chunks.splice(chunkIndex, 1);
        }
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
  removeEvent,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;

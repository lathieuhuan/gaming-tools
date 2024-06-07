import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AddBonusPayload, AddEventPayload, AddSimulationPayload, SimulatorState } from "./simulator-slice.types";
import { Setup_ } from "@Src/utils";
import { $AppSettings } from "@Src/services";
import { ModifyEvent } from "@Src/types";
import { getActiveSimulation, getMember } from "./simulator-slice.utils";

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
        modifyEvents = [],
        attackEvents = [],
        target = Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
      } = action.payload;

      if (members) {
        state.activeId = id;
        state.activeMember = members[0].info.name;
        state.simulationManageInfos.push({
          id,
          name: "Simulation 1",
        });
        state.simulationsById[id] = {
          members,
          modifyEvents,
          attackEvents,
          target,
        };
      }
    },
    addEvent: (state, action: AddEventPayload) => {
      const { type, event } = action.payload;

      switch (type) {
        case "MODIFY":
          getActiveSimulation(state)?.modifyEvents.push(event);
      }
    },
    addBonus: (state, action: AddBonusPayload) => {
      const { type, toCharacter, bonus } = action.payload;

      if (type === "ATTRIBUTE") {
        getMember(state, toCharacter)?.bonus.attributeBonus.push(bonus);
      } else {
        getMember(state, toCharacter)?.bonus.attackBonus.push(bonus);
      }
    },
  },
});

export const { addSimulation, addEvent, addBonus } = simulatorSlice.actions;

export default simulatorSlice.reducer;

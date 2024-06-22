import type { PayloadAction } from "@reduxjs/toolkit";
import type { HitEvent, ModifyEvent, Simulation, SimulationEvent, SimulationManageInfo } from "@Src/types";

export type SimulatorState = {
  activeId: number;
  activeMember: string;
  simulationManageInfos: SimulationManageInfo[];
  simulationsById: Record<string, Simulation>;
};

export type AddSimulationPayload = PayloadAction<Partial<Simulation>>;

export type AddEventPayload = PayloadAction<
  (Omit<ModifyEvent, "id"> | Omit<HitEvent, "id">) & {
    /** The character performing this event also switch to on field => create new chunk */
    alsoSwitch?: boolean;
  }
>;

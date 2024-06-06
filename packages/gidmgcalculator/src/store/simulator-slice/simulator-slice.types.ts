import type { PayloadAction } from "@reduxjs/toolkit";
import type { Simulation, SimulationManageInfo } from "@Src/types";

export type SimulatorState = {
  activeId: number;
  activeMember: string;
  simulationManageInfos: SimulationManageInfo[];
  simulationsById: Record<string, Simulation>;
};

export type AddSimulationPayload = PayloadAction<Partial<Simulation>>;

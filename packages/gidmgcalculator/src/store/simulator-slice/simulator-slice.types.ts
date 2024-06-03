import type { PartiallyRequired } from "rond";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Simulation, SimulationManageInfo } from "@Src/types";

export type SimulatorState = {
  active: {
    simulationId: number;
    member: string;
  };
  simulationManageInfos: SimulationManageInfo[];
  simulationsById: Record<string, Simulation>;
};

export type AddSimulationPayload = PayloadAction<PartiallyRequired<Partial<Simulation>, "members">>;

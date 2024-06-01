import type { Simulation, SimulationManageInfo } from "@Src/types";

export type SimulatorState = {
  active: {
    simulationId: number;
    member: string;
  };
  simulationManageInfos: SimulationManageInfo[];
  simulationsById: Record<string, Simulation>;
};

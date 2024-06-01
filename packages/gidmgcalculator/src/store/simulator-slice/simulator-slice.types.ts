import type { Simulation, SimulationManageInfo } from "@Src/types";

export type SimulatorState = {
  activeId: number;
  simulationManageInfos: SimulationManageInfo[];
  simulationsById: Record<string, Simulation>;
};

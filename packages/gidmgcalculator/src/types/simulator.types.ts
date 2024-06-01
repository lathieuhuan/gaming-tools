import type { Level } from "@Backend";
import type { CalcArtifact, CalcWeapon } from "./calculator.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

export type Simulation = {
  actions: unknown[];
  members: Array<{
    name: string;
    level: Level;
    cons: number;
    NAs: number;
    ES: number;
    EB: number;
    weapon: CalcWeapon;
    artifacts: Array<CalcArtifact | null>;
  }>;
};

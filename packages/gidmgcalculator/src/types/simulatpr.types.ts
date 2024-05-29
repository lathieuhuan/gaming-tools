import type { Level } from "@Backend";
import type { CalcArtifact, CalcWeapon } from "./calculator.types";

export type Simulation = {
  name: string;
  id: number;
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

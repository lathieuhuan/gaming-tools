import type { Artifact, Character, Weapon } from "./global.types";
import type { Target } from "./calculator.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

export type SimulationMember = Character & {
  weapon: Weapon;
  artifacts: Array<Artifact | null>;
};

export type SimulationTarget = Target;

export type Simulation = {
  actions: unknown[];
  members: SimulationMember[];
  target: SimulationTarget;
};

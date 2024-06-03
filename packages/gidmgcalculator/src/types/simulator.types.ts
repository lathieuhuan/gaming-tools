import type { Artifact, Character, Weapon } from "./global.types";
import type { Target } from "./calculator.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

type TriggerEvent = {
  character: string;
  modId: number;
  modInputs: number[];
};

type ActionEvent = {
  character: string;
};

export type SimulationMember = Character & {
  weapon: Weapon;
  artifacts: Array<Artifact | null>;
};

export type SimulationTarget = Target;

export type Simulation = {
  members: SimulationMember[];
  triggerEvents: TriggerEvent[];
  actionEvents: ActionEvent[];
  target: SimulationTarget;
};

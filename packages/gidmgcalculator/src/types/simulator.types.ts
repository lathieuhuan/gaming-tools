import type { ActualAttackPattern, AttackElement } from "@Backend";
import type { Target } from "./calculator.types";
import type { Artifact, Character, Weapon } from "./global.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

type BaseEvent = {
  performer: string;
};

export type ModifyEvent = BaseEvent & {
  type: "MODIFY";
  modifier: {
    id: number;
    inputs: number[];
  };
};

export type HitEvent = BaseEvent & {
  type: "HIT";
  calcItemId: string;
  damage: number;
  attElmt: AttackElement;
  attPatt: ActualAttackPattern;
  duration: number;
};

export type SimulationEvent = ModifyEvent | HitEvent;

export type SimulationMember = Character & {
  weapon: Weapon;
  artifacts: Array<Artifact | null>;
};

export type SimulationTarget = Target;

/** ==========*** SIMULATION ***========== */

export type Simulation = {
  members: SimulationMember[];
  events: SimulationEvent[];
  target: SimulationTarget;
};

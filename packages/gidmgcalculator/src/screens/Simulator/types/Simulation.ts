import type { ExactOmit } from "rond";

import type { CharacterCalc } from "@/models/CharacterCalc";
import type { TargetCalc } from "@/models/TargetCalc";
import type { IDbCharacter } from "@/types";
import type { SimulationProcessor } from "../logic/SimulationProcessor";
import type { CharacterEvent } from "./CharacterEvent";
import type { EnvironmentEvent } from "./EnvironmentEvent";

export type SimulationEvent = CharacterEvent | EnvironmentEvent;

// ===== DB Simulation =====

type DbSimulation = {
  id: number;
  memberOrder: number[];
  members: Record<PropertyKey, IDbCharacter>;
  timeline: SimulationEvent[];
};

// ===== App Simulation =====

export type SimulationMembers = Record<PropertyKey, CharacterCalc>;

export type Simulation = ExactOmit<DbSimulation, "members"> & {
  members: SimulationMembers;
  activeMember: number;
  target: TargetCalc;
  processor: SimulationProcessor;
};

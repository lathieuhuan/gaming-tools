import type { ExactOmit } from "rond";

import type { Character, TargetCalc } from "@/models";
import type { DbCharacter } from "@/types";
import type { SimulationProcessor } from "../logic/SimulationProcessor";
import type { CharacterEvent } from "./CharacterEvent";
import type { EnvironmentEvent } from "./EnvironmentEvent";

export type SimulationEvent = CharacterEvent | EnvironmentEvent;

// ===== DB Simulation =====

type DbSimulation = {
  id: number;
  memberOrder: number[];
  members: Record<PropertyKey, DbCharacter>;
  timeline: SimulationEvent[];
};

// ===== App Simulation =====

export type InputsById = Record<number, number[]>;

export type ModCategory = "ABILITY_BUFF" | "WEAPON_BUFF";

export type MemberInputs = Record<ModCategory, InputsById>;

export type SimulationInputs = Record<number, MemberInputs>;

export type SimulationMembers = Record<number, Character>;

export type Simulation = ExactOmit<DbSimulation, "members"> & {
  members: SimulationMembers;
  activeMember: number;
  inputs: SimulationInputs;
  target: TargetCalc;
  processor: SimulationProcessor;
};

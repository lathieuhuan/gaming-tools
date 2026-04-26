import type { ExactOmit } from "rond";

import type { Member } from "@/models/Member";
import type { TargetCalc } from "@/models/TargetCalc";
import type { DbCharacter } from "@/types";
import type { SimulationProcessor } from "../models/SimulationProcessor";
import type { MemberEvent } from "./MemberEvent";
import type { EnvironmentEvent } from "./EnvironmentEvent";

export type SimulationEvent = MemberEvent | EnvironmentEvent;

// ===== DB Simulation =====

type DbSimulation = {
  id: number;
  members: DbCharacter[];
  timeline: SimulationEvent[];
};

// ===== App Simulation =====

export type InputsById = Record<number, number[]>;

export type ModCategory = "ABILITY_BUFF" | "WEAPON_BUFF";

export type MemberInputs = Record<ModCategory, InputsById>;

export type SimulationInputs = Record<number, MemberInputs>;

export type Simulation = ExactOmit<DbSimulation, "members"> & {
  memberOrder: number[];
  members: Map<number, Member>;
  activeMember: number;
  inputs: SimulationInputs;
  target: TargetCalc;
  processor: SimulationProcessor;
};

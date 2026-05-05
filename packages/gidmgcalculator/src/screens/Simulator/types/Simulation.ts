import type { ExactOmit } from "rond";

import type { TargetCalc } from "@/models/TargetCalc";
import type { DbCharacter } from "@/types";
import type { EEventCategory } from "../configs";
import type { Member } from "../models/Member";
import type { SimulationProcessor } from "../models/SimulationProcessor";
import type { EnvironmentEvent, RawEnvironmentEvent } from "./EnvironmentEvent";
import type { MemberEvent, RawMemberEvent } from "./MemberEvent";
import type { RawTeamEvent, TeamEvent } from "./TeamEvent";

export type DbSimulationEvent = RawMemberEvent | RawTeamEvent | RawEnvironmentEvent;

// ===== DB Simulation =====

type DbSimulation = {
  id: number;
  members: DbCharacter[];
  timeline: DbSimulationEvent[];
};

// ===== App Simulation =====

export type InputsById = Record<number, number[]>;

export type ModCategory = "ABILITY_BUFF" | "WEAPON_BUFF" | "ARTIFACT_BUFF";

export type MemberInputs = Record<ModCategory, InputsById>;

export type SimulationMemberInputs = Record<number, MemberInputs>;

export type SimulationTeamInputs = Record<string, number[]>;

export type ErrorEvent = {
  id: string;
  cate: EEventCategory.ERROR;
  message: string;
};

export type SimulationEvent = MemberEvent | TeamEvent | EnvironmentEvent | ErrorEvent;

export type Simulation = ExactOmit<DbSimulation, "members"> & {
  memberOrder: number[];
  members: Map<number, Member>;
  activeMember: number;
  memberInputs: SimulationMemberInputs;
  teamInputs: SimulationTeamInputs;
  target: TargetCalc;
  processor: SimulationProcessor;
};

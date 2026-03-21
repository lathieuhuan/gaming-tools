import type { ExactOmit } from "rond";

import type { CharacterCalc } from "@/models";
import type { AttackReaction, IDbCharacter, LevelableTalentType } from "@/types";

type BaseEvent = {
  id: string;
  performer: number;
};

export type SwitchInEvent = BaseEvent & {
  type: "SI";
};

// ===== Modify Event =====

export type ModifyEvent = BaseEvent & {
  type: "M";
};

// ===== Hit Event =====

type BaseHitEvent = BaseEvent & {
  type: "H";
};

export type TalentHitEvent = BaseHitEvent & {
  subType: "Th";
  talent: LevelableTalentType;
  index: number; // temporary works as id of the hit
  reaction?: AttackReaction;
};

export type ReactionHitEvent = BaseHitEvent & {
  subType: "Rh";
};

export type HitEvent = TalentHitEvent | ReactionHitEvent;

// ===== Simulation Event =====

export type SimulationEvent = SwitchInEvent | ModifyEvent | HitEvent;

export type EventsByMember = Record<number, Record<string, SimulationEvent>>;

// ===== Event Metadata =====

type MemberPerformer = {
  type: "M";
  code: number;
};

type EnvironmentPerformer = {
  type: "E";
};

export type EventMetadata = {
  id: string;
  performer: MemberPerformer | EnvironmentPerformer;
};

// ===== DB Simulation =====

type DbSimulation = {
  id: number;
  memberOrder: number[];
  members: Record<PropertyKey, IDbCharacter>;
  eventsByMember: EventsByMember;
  timeline: EventMetadata[];
};

// ===== App Simulation =====

export type SimulationSummary = {
  totalDamage: number;
};

export type Simulation = ExactOmit<DbSimulation, "members"> & {
  members: Record<PropertyKey, CharacterCalc>;
  onFieldMember: number;
  activeMember: number;
  summary: SimulationSummary;
};

import { TeamBuffSpec } from "@/types";
import { EEventCategory, EHitEventType, EModifyEventType } from "../configs";

type TeamEventCore = {
  id: string;
  cate: EEventCategory.TEAM;
};

type RawTeamEventBase = TeamEventCore & {};

type TeamEventBase = TeamEventCore & {};

// # Team Buff Event

type TeamBuffEventBase = {
  type: EModifyEventType.TEAM_BUFF;
  inputs?: number[];
};

export type RawTeamBuffEvent = RawTeamEventBase &
  TeamBuffEventBase & {
    modId: number;
  };

export type TeamBuffEvent = TeamEventBase &
  TeamBuffEventBase & {
    buff: TeamBuffSpec;
  };

// # Team Hit Event

type TeamHitEventBase = {
  type: EHitEventType.TEAM_HIT;
};

export type RawTeamHitEvent = RawTeamEventBase & TeamHitEventBase & {};

export type TeamHitEvent = TeamEventBase & TeamHitEventBase & {};

// ===== Team Event =====

export type RawTeamEvent = RawTeamBuffEvent | RawTeamHitEvent;

export type TeamEvent = TeamBuffEvent | TeamHitEvent;
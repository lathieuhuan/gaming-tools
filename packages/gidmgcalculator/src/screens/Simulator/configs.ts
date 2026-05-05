export const SIMULATION_NAME_MAX_LENGTH = 20;

export enum EEventCategory {
  MEMBER = "M",
  TEAM = "T",
  ENVIRONMENT = "E",
  ERROR = "X",
}

export enum EModifyEventType {
  ABILITY_BUFF = "AB",
  WEAPON_BUFF = "WB",
  ARTIFACT_SET_BUFF = "ASB",
  TEAM_BUFF = "TB",
}

export enum EHitEventType {
  ABILITY_HIT = "AH",
  REACTION_HIT = "RH",
  TEAM_HIT = "TH",
}

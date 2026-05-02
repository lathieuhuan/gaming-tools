export const SIMULATION_NAME_MAX_LENGTH = 20;

export enum EEventCategory {
  MEMBER = "M",
  ENVIRONMENT = "E",
  ERROR = "X",
}

export enum EModifyEventType {
  ABILITY_BUFF = "AB",
  WEAPON_BUFF = "WB",
  ARTIFACT_SET_BUFF = "ASB",
}

export enum EHitEventType {
  ABILITY_HIT = "AH",
  REACTION_HIT = "RH",
}

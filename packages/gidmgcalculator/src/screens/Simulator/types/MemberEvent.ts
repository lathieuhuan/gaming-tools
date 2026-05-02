import type {
  AppArtifact,
  AppCharacter,
  AppWeapon,
  ArtifactBuff,
  AttackElement,
  AttackPattern,
  AttackReaction,
  CharacterBuff,
  WeaponBuff,
} from "@/types";
import type { EEventCategory, EHitEventType, EModifyEventType } from "../configs";

type RawMemberEventBase = {
  id: string;
  cate: EEventCategory.MEMBER;
};

type DbMemberEventBase = RawMemberEventBase & {
  performer: number;
};

type MemberEventBase = RawMemberEventBase & {
  performer: AppCharacter;
};

// # Modify Event

type SwitchInEventBase = {
  type: "SI";
};

export type DbSwitchInEvent = DbMemberEventBase & SwitchInEventBase;

export type SwitchInEvent = MemberEventBase & SwitchInEventBase;

// # Modify Event

export type DbModifyEvent = DbMemberEventBase & {
  type: EModifyEventType;
  modId: number;
  inputs?: number[];
};

export type ModifyEvent = AbilityBuffEvent | WeaponBuffEvent | ArtifactBuffEvent;

export type AbilityBuffEvent = MemberEventBase & {
  type: EModifyEventType.ABILITY_BUFF;
  buff: CharacterBuff;
  inputs?: number[];
};

export type WeaponBuffEvent = MemberEventBase & {
  type: EModifyEventType.WEAPON_BUFF;
  item: AppWeapon;
  buff: WeaponBuff;
  inputs?: number[];
};

export type ArtifactBuffEvent = MemberEventBase & {
  type: EModifyEventType.ARTIFACT_SET_BUFF;
  item: AppArtifact;
  buff: ArtifactBuff;
  inputs?: number[];
};

// # Hit Event

export type DbHitEvent = DbAbilityHitEvent | DbReactionHitEvent;

export type HitEvent = AbilityHitEvent | ReactionHitEvent;

// ## Ability Hit Event

type AbilityHitEventBase = {
  type: EHitEventType.ABILITY_HIT;
  talent: AttackPattern;
  index: number; // temporary works as id of the hit
  attElmt?: AttackElement;
  reaction?: AttackReaction;
};

export type DbAbilityHitEvent = DbMemberEventBase & AbilityHitEventBase;

export type AbilityHitEvent = MemberEventBase & AbilityHitEventBase;

// ## Reaction Hit Event

type ReactionHitEventBase = {
  type: EHitEventType.REACTION_HIT;
};

export type ReactionHitEvent = MemberEventBase & ReactionHitEventBase;

export type DbReactionHitEvent = DbMemberEventBase & ReactionHitEventBase;

// ===== Member Event =====

export type DbMemberEvent = DbSwitchInEvent | DbModifyEvent | DbHitEvent;

export type MemberEvent = SwitchInEvent | ModifyEvent | HitEvent;

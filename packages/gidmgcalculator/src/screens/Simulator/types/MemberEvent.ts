import type {
  AppArtifact,
  AppCharacter,
  AppWeapon,
  ArtifactBuff,
  AttackPattern,
  AttackReaction,
  CharacterBuff,
  WeaponBuff,
} from "@/types";
import type { EEventCategory, EHitEventType, EModifyEventType } from "../configs";
import type { ForceAttackElement } from "./calculation";

type MemberEventCore = {
  id: string;
  cate: EEventCategory.MEMBER;
};

type RawMemberEventBase = MemberEventCore & {
  performer: number;
};

type MemberEventBase = MemberEventCore & {
  performer: AppCharacter;
};

// # Modify Event

type SwitchInEventBase = {
  type: "SI";
};

export type RawSwitchInEvent = RawMemberEventBase & SwitchInEventBase;

export type SwitchInEvent = MemberEventBase & SwitchInEventBase;

// # Modify Event

export type RawModifyEvent = RawAbilityBuffEvent | RawWeaponBuffEvent | RawArtifactBuffEvent;

export type ModifyEvent = AbilityBuffEvent | WeaponBuffEvent | ArtifactBuffEvent;

// ## Ability Buff Event

type AbilityBuffEventBase = {
  type: EModifyEventType.ABILITY_BUFF;
  inputs?: number[];
};

export type RawAbilityBuffEvent = RawMemberEventBase &
  AbilityBuffEventBase & {
    modId: number;
  };

export type AbilityBuffEvent = MemberEventBase &
  AbilityBuffEventBase & {
    buff: CharacterBuff;
  };

// ## Weapon Buff Event

type WeaponBuffEventBase = {
  type: EModifyEventType.WEAPON_BUFF;
  inputs?: number[];
};

export type RawWeaponBuffEvent = RawMemberEventBase &
  WeaponBuffEventBase & {
    modId: number;
  };

export type WeaponBuffEvent = MemberEventBase &
  WeaponBuffEventBase & {
    item: AppWeapon;
    buff: WeaponBuff;
  };

// ## Artifact Set Buff Event

type ArtifactBuffEventBase = {
  type: EModifyEventType.ARTIFACT_SET_BUFF;
  inputs?: number[];
};

export type RawArtifactBuffEvent = RawMemberEventBase &
  ArtifactBuffEventBase & {
    itemId: number;
    modId: number;
  };

export type ArtifactBuffEvent = MemberEventBase &
  ArtifactBuffEventBase & {
    item: AppArtifact;
    buff: ArtifactBuff;
  };

// # Hit Event

export type RawHitEvent = RawAbilityHitEvent | RawReactionHitEvent;

export type HitEvent = AbilityHitEvent | ReactionHitEvent;

// ## Ability Hit Event

type AbilityHitEventBase = {
  type: EHitEventType.ABILITY_HIT;
  talent: AttackPattern;
  index: number; // temporary works as id of the hit
  forcedElmt: ForceAttackElement;
  reaction: AttackReaction;
};

export type RawAbilityHitEvent = RawMemberEventBase & AbilityHitEventBase;

export type AbilityHitEvent = MemberEventBase & AbilityHitEventBase;

// ## Reaction Hit Event

type ReactionHitEventBase = {
  type: EHitEventType.REACTION_HIT;
};

export type RawReactionHitEvent = RawMemberEventBase & ReactionHitEventBase;

export type ReactionHitEvent = MemberEventBase & ReactionHitEventBase;

// ===== Member Event =====

export type RawMemberEvent = RawSwitchInEvent | RawModifyEvent | RawHitEvent;

export type MemberEvent = SwitchInEvent | ModifyEvent | HitEvent;

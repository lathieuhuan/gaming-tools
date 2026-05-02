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

export type DbModifyEvent = DbAbilityBuffEvent | DbWeaponBuffEvent | DbArtifactBuffEvent;

export type ModifyEvent = AbilityBuffEvent | WeaponBuffEvent | ArtifactBuffEvent;

// ## Ability Buff Event

type AbilityBuffEventBase = {
  type: EModifyEventType.ABILITY_BUFF;
  inputs?: number[];
};

export type DbAbilityBuffEvent = DbMemberEventBase & AbilityBuffEventBase & {
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

export type DbWeaponBuffEvent = DbMemberEventBase &
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

export type DbArtifactBuffEvent = DbMemberEventBase & ArtifactBuffEventBase & {
  itemId: number;
  modId: number;
};

export type ArtifactBuffEvent = MemberEventBase &
  ArtifactBuffEventBase & {
    item: AppArtifact;
    buff: ArtifactBuff;
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

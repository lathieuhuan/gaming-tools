import type { AttackReaction } from "@/types";
import type { AttackElement, AttackPattern } from "@/types/common";

type BaseEvent = {
  id: string;
  cate: "M";
  performer: number;
};

export type SwitchInEvent = BaseEvent & {
  type: "SI";
};

// ===== Modify Event =====

export type AbilityBuffEvent = BaseEvent & {
  type: "AB";
  modId: number;
  inputs?: number[];
}

export type WeaponBuffEvent = BaseEvent & {
  type: "WB";
  modId: number;
  inputs?: number[];
}

export type ModifyEvent = AbilityBuffEvent | WeaponBuffEvent;

// ===== Hit Event =====

export type AbilityHitEvent = BaseEvent & {
  type: "AH";
  talent: AttackPattern;
  index: number; // temporary works as id of the hit
  attElmt?: AttackElement;
  reaction?: AttackReaction;
};

export type ReactionHitEvent = BaseEvent & {
  type: "RH";
};

export type HitEvent = AbilityHitEvent | ReactionHitEvent;

// ===== Member Event =====

export type MemberEvent = SwitchInEvent | ModifyEvent | HitEvent;

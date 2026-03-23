import type { AttackReaction } from "@/types/calculation";
import type { AttackElement, AttackPattern } from "@/types/common";

type BaseEvent = {
  id: string;
  cate: "C";
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

// ===== Character Event =====

export type CharacterEvent = SwitchInEvent | ModifyEvent | HitEvent;

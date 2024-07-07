import type { AppCharacter, AppliedAttackBonus, AppliedAttributeBonus, AttackBonusKey, AttackBonusType, AttributeStat, LevelableTalentType } from "@Backend";
import type { Artifact, Character, Weapon } from "./global.types";
import type { ElementModCtrl, PartyData, Target } from "./calculator.types";

export type SimulationManageInfo = {
  id: number;
  name: string;
};

/** ========== EVENTS ========== */

type CharacterPerformer = {
  type: "CHARACTER";
  code: number;
};

type BaseEvent = {
  id: number;
  performer: CharacterPerformer;
  /** required if alsoSwitch and is HitEvent */
  duration?: number;
};

export type ModifyEvent = BaseEvent & {
  type: "MODIFY";
  modifier: {
    type: "CHARACTER" | "WEAPON" | "ARTIFACT";
    code: number;
    id: number;
    inputs?: number[];
  };
};

export type TalentHitEventMod = Pick<ElementModCtrl, "absorption" | "reaction" | "infuse_reaction">;

export type HitEvent = BaseEvent & {
  type: "HIT";
  talent: LevelableTalentType;
  calcItemId: string;
  elmtModCtrls?: TalentHitEventMod;
};

export type SimulationEvent = ModifyEvent | HitEvent;

export type SimulationMember = Character & {
  weapon: Weapon;
  artifacts: Array<Artifact | null>;
};

export type SimulationPartyData = AppCharacter[];

/** ========== BONUSES ========== */

export type SimulationBonusCore = {
  id: string;
  value: number;
  description: string;
};

export type SimulationAttributeBonus = AppliedAttributeBonus & {
  type: "ATTRIBUTE";
};

export type SimulationAttackBonus = AppliedAttackBonus & {
  type: "ATTACK";
};

/** ==========*** SIMULATION ***========== */

export type SimulationTarget = Target;

export type SimulationChunk = {
  id: string;
  ownerCode: number;
  events: SimulationEvent[];
};

export type Simulation = {
  members: SimulationMember[];
  chunks: SimulationChunk[];
  target: SimulationTarget;
};

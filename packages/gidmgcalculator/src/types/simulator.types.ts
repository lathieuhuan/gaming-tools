import type { AttackBonusKey, AttackBonusType, AttributeStat, LevelableTalentType } from "@Backend";
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
  /** The character performing this event also switch to on field */
  alsoSwitch?: boolean;
  /** required if alsoSwitch and is HitEvent */
  duration?: number;
};

export type ModifyEvent = BaseEvent & {
  type: "MODIFY";
  modifier: {
    id: number;
    inputs: number[];
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

export type SimulationPartyData = NonNullable<PartyData[number]>[];

/** ========== BONUSES ========== */

export type SimulationBonusCore = {
  trigger: {
    character: string;
    modifier: string;
  };
  value: number;
};

export type SimulationAttributeBonus = SimulationBonusCore & {
  type: "ATTRIBUTE";
  stable: boolean;
  toStat: AttributeStat;
};

export type SimulationAttackBonus = SimulationBonusCore & {
  type: "ATTACK";
  toType: AttackBonusType;
  toKey: AttackBonusKey;
};

/** ==========*** SIMULATION ***========== */

export type SimulationTarget = Target;

export type Simulation = {
  members: SimulationMember[];
  events: SimulationEvent[];
  target: SimulationTarget;
};

import type { StatType } from "./common";

export type AppCharacter = {
  id: number;
  beta?: boolean;
  name: string;
  icon: string;
  rarity: number;
  maxEnergy: number;
  stats: number[][];
  basic: ActiveAbility;
  skill: ActiveAbility;
  ultimate: ActiveAbility;
  talent: PassiveAbility;
  technique: ActiveAbility;
  traces: Trace[];
};

// ========== ABILITIES ==========

type AbilityEffectMultiplier = {
  value: number;
  baseOn: "hp" | "atk" | "def";
};

type AbilityAttackEffect = {
  type: "ATTACK";
  multiplier: number | AbilityEffectMultiplier | AbilityEffectMultiplier[];
  adjacentMult?: number | AbilityEffectMultiplier | AbilityEffectMultiplier[];
  toughReduce?: number;
};

type AbilityShieldEffect = {
  type: "SHIELD";
  multiplier: number | AbilityEffectMultiplier | AbilityEffectMultiplier[];
  extra?: number;
  turns: number;
};

type AbilityFreezeEffect = {
  type: "FREEZE";
  dot: number | AbilityEffectMultiplier | AbilityEffectMultiplier[];
  chance: number;
  turns: number;
};

type AbilityEffect = (AbilityAttackEffect | AbilityShieldEffect | AbilityFreezeEffect) & {
  id: number;
};

type ActiveAbility = {
  name: string;
  target: {
    type: "ALLY" | "ENEMY";
    scope: "SINGLE" | "MULTIPLE" | "PARTY";
  };
  energyRestore?: number;
  effects: AbilityEffect | AbilityEffect[];
  pointCost?: boolean;
  energyCost?: number;
};

type PassiveAbility = {
  name: string;
  effects: AbilityEffect | AbilityEffect[];
  // condition
  maxTriggersPerTurn?: number;
};

// ========== TRACES ==========

type TraceDamageBoostEffect = {
  type: "DMG_BOOST";
  value: number;
};

type TraceStatBoostEffect = {
  type: "STAT_BOOST";
  value: number;
  to: StatType;
};

type TraceAbilityEnhanceEffect = {
  type: "ABILITY_ENHANCE";
};

type TraceEffect = TraceDamageBoostEffect | TraceStatBoostEffect | TraceAbilityEnhanceEffect;

type Trace = {
  name: string;
  require?: "A2" | "A3" | "A4" | "A5" | "A6" | "LV75" | "LV80";
  description: string;
  effects: TraceEffect | TraceEffect[];
};

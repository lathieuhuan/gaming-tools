import type { AttackType, EntityStatusType, StatType } from "./common";

type AppEntityBonusCheckHpThreshold = {
  type: "HP_THRESHOLD";
  value: number;
  compare: "<" | ">";
};

type AppEntityBonusSelfCheck = AppEntityBonusCheckHpThreshold;

type AppEntityBonusCore = {
  /** Default to 'SELF' */
  scope?: "SELF" | "PARTY";
  value: number;
  /** Bonuses with the same stackId cannot stack */
  stackId?: string;
  /** Only on scope 'SELF' */
  checkSelf?: AppEntityBonusSelfCheck;
};

type AppEntityBonus_Stats = AppEntityBonusCore & {
  type: "STATS";
  toStats: StatType | StatType[];
};

type AppEntityBonus_AttackTypeCompareHpThreshold = {
  type: "COMPARE_HP";
  compare: ">=";
};

type AppEntityBonus_AttackTypeCheckTargetHp =
  | AppEntityBonusCheckHpThreshold
  | AppEntityBonus_AttackTypeCompareHpThreshold;

type AppEntityBonus_AttackType = AppEntityBonusCore & {
  type: "ATK_TYPES";
  toTypes: "ALL" | AttackType | AttackType[];
  /** Default to 'pct_' */
  toProps?: "pct_" | "cDmg_";
  checkTargetStatus?: EntityStatusType;
  checkTargetHp?: AppEntityBonus_AttackTypeCheckTargetHp;
};

export type AppEntityBonus = (AppEntityBonus_Stats | AppEntityBonus_AttackType) & {
  turns?: number;
};

// ========== ABILITY TRIGGER ==========

type AppEntityAbilityTrigger_BattleStart = {
  type: "BATTLE_START";
};

type AppEntityAbilityTrigger_EnemyDefeated = {
  type: "ENEMY_DEFEATED";
  checkSource?: "SELF";
};

type AppEntityAbilityTrigger_AllyAttacked = {
  type: "ALLY_ATTACKED";
  checkTarget?: "SELF";
  checkStatuses?: EntityStatusType;
};

type AppEntityPassiveAbilityEffect_BasicCast = {
  type: "BASIC_CAST";
  checkSource?: "SELF";
};

type AppEntityPassiveAbilityEffect_SkillCast = {
  type: "SKILL_CAST";
  checkSource?: "SELF";
};

type AppEntityPassiveAbilityEffect_UltimateCast = {
  type: "ULTIMATE_CAST";
  checkSource?: "SELF";
};

type AppEntityAbilityTrigger_Attack = {
  type: "ATTACK";
  checkStatuses?: EntityStatusType | EntityStatusType[];
};

type AppEntityAbilityTrigger_WeaknessBreak = {
  type: "BREAK";
  checkSource?: "SELF";
};

type AppEntityAbilityTrigger =
  | AppEntityAbilityTrigger_BattleStart
  | AppEntityAbilityTrigger_EnemyDefeated
  | AppEntityAbilityTrigger_AllyAttacked
  | AppEntityPassiveAbilityEffect_BasicCast
  | AppEntityPassiveAbilityEffect_SkillCast
  | AppEntityPassiveAbilityEffect_UltimateCast
  | AppEntityAbilityTrigger_Attack
  | AppEntityAbilityTrigger_WeaknessBreak;

// ========== ABILITY EFFECT ==========

type AppEntityPassiveAbilityEffect_StatsBoost = {
  type: "STATS_BOOST";
  value: number;
  toStats: StatType;
  turns?: number;
};

type AppEntityPassiveAbilityEffect_AttackEnhance = {
  type: "ATK_ENHANCE";
  value: number;
  basedOn?: "hp" | "atk" | "def";
  toTypes: "ALL" | AttackType | AttackType[];
  /** Default to 'pct_' */
  toAspect?: "pct_" | "cRate_" | "cDmg_" | "flat";
  quota?: number;
};

type AppEntityPassiveAbilityEffect_CounterAttack = {
  type: "COUNTER";
  multiplier: number;
};

type AppEntityPassiveAbilityEffect_Heal = {
  type: "HEAL";
  multiplier: number;
  /** Default to 'SELF' */
  scope?: "SELF" | "PARTY";
};

type AppEntityPassiveAbilityEffect_Replenish = {
  type: "REPLENISH";
  value: number;
  /** Default to 'SELF' */
  scope?: "SELF" | "PARTY";
};

type AppEntityPassiveAbilityEffect_AdvancedForward = {
  type: "ADVANCED_FORWARD";
  value: number;
};

type AppEntityPassiveAbilityEffect =
  | AppEntityPassiveAbilityEffect_StatsBoost
  | AppEntityPassiveAbilityEffect_AttackEnhance
  | AppEntityPassiveAbilityEffect_CounterAttack
  | AppEntityPassiveAbilityEffect_Heal
  | AppEntityPassiveAbilityEffect_Replenish
  | AppEntityPassiveAbilityEffect_AdvancedForward;

export type AppEntityPassiveAbility = {
  trigger: AppEntityAbilityTrigger | AppEntityAbilityTrigger[];
  effects: AppEntityPassiveAbilityEffect;
  maxTriggersPerTurn?: number;
};

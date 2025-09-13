import type { EntityBonus, EntityBonusEffect } from "./entity-bonus.types";
import type { EntityPenalty, EntityPenaltyEffect } from "./entity-penalty.types";

export type ModifierAffectType = "SELF" | "TEAMMATE" | "SELF_TEAMMATE" | "PARTY" | "ONE_UNIT" | "ACTIVE_UNIT";

export type ModInputType = "LEVEL" | "TEXT" | "CHECK" | "STACKS" | "SELECT" | "ANEMOABLE" | "DENDROABLE" | "ELEMENTAL";

export type ModInputConfig = {
  label?: string;
  type: ModInputType;
  for?: "FOR_SELF" | "FOR_TEAM";
  /** See ModifierControl model for default value */
  init?: number;
  max?: number;
  options?: string[];
};

// ========== BUFF ==========

export type EntityBuff<TEntityEffect extends EntityBonusEffect = EntityBonusEffect> = {
  /** This is id */
  index: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  effects?: EntityBonus<TEntityEffect> | EntityBonus<TEntityEffect>[];
};

// ========== DEBUFF ==========

export type EntityDebuff<TEntityPenalty extends EntityPenaltyEffect = EntityPenaltyEffect> = {
  /** This is id */
  index: number;
  inputConfigs?: ModInputConfig[];
  effects?: EntityPenalty<TEntityPenalty>;
};

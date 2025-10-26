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
  options?: (string | number)[];
  note?: string;
};

export type EntityModifier = {
  /** This is id */
  index: number;
  inputConfigs?: ModInputConfig[];
  teamBuffId?: string;
};

// ========== BUFF ==========

export type EntityBuff<TEntityEffect extends EntityBonusEffect = EntityBonusEffect> = EntityModifier & {
  affect: ModifierAffectType;
  effects?: EntityBonus<TEntityEffect> | EntityBonus<TEntityEffect>[];
};

// ========== DEBUFF ==========

export type EntityDebuff<TEntityPenalty extends EntityPenaltyEffect = EntityPenaltyEffect> = EntityModifier & {
  effects?: EntityPenalty<TEntityPenalty>;
};

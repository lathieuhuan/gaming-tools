import type { EntityBonus, EntityBonusEffect } from "./entity-bonus";
import type { EntityPenalty, EntityPenaltyEffect } from "./entity-penalty";

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
  /** For config with options. In rem. Default 7 */
  menuWidth?: number;
  note?: string;
};

export type EntityModifier = {
  /** This is id */
  index: number;
  inputConfigs?: ModInputConfig[];
  teamBuffId?: number;
};

// ========== BUFF ==========

export type EntityBuff<TEntityEffect extends EntityBonusEffect = EntityBonusEffect> = EntityModifier & {
  affect: ModifierAffectType;
  effects?: EntityBonus<TEntityEffect> | EntityBonus<TEntityEffect>[];
};

// ========== DEBUFF ==========

export type EntityDebuff<TEntityPenalty extends EntityPenaltyEffect = EntityPenaltyEffect> = EntityModifier & {
  effects?: EntityPenalty<TEntityPenalty> | EntityPenalty<TEntityPenalty>[];
};

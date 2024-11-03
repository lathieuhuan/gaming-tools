import { EntityBonus, EntityBonusCore } from "./entity-bonus.types";
import { EntityPenalty, EntityPenaltyCore } from "./entity-penalty.types";

export type ModifierAffectType = "SELF" | "TEAMMATE" | "SELF_TEAMMATE" | "PARTY" | "ONE_UNIT" | "ACTIVE_UNIT";

type ModInputType = "LEVEL" | "TEXT" | "CHECK" | "STACKS" | "SELECT" | "ANEMOABLE" | "DENDROABLE" | "ELEMENTAL";

type ModInputConfig = {
  label?: string;
  type: ModInputType;
  for?: "FOR_SELF" | "FOR_TEAM";
  /** See ModifierControl model for default value */
  initialValue?: number;
  max?: number;
  options?: string[];
};

// ========== BUFF ==========

export type EntityBuff<TEntityBonusCore extends EntityBonusCore> = {
  id: number;
  affect: ModifierAffectType;
  inputConfigs?: ModInputConfig[];
  effects?: EntityBonus<TEntityBonusCore> | EntityBonus<TEntityBonusCore>[];
  /**
   * id for tracking unstackability.
   * Effects under the same unstackableId and have the same bonus path cannot be stacked.
   * CharacterBuff should not have this
   */
  unstackableId?: string;
};

// ========== DEBUFF ==========

export type EntityDebuff<TEntityPenalty extends EntityPenaltyCore> = {
  /** This is id */
  id: number;
  inputConfigs?: ModInputConfig[];
  effects?: EntityPenalty<TEntityPenalty>;
};

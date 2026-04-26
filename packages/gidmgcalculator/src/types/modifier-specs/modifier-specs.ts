import type { BonusSpec } from "./bonus-spec";
import type { PenaltySpec } from "./penalty-spec";

export type ModAffectType = "SELF" | "TEAMMATE" | "SELF_TEAMMATE" | "PARTY" | "ONE_UNIT" | "ACTIVE_UNIT";

export type ModInputType = "LEVEL" | "TEXT" | "CHECK" | "STACKS" | "SELECT" | "ANEMOABLE" | "DENDROABLE" | "ELEMENTAL";

export type ModInputSpec = {
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

export type ModifierBaseSpec = {
  /** This is id */
  index: number;
  inputConfigs?: ModInputSpec[];
  teamBuffId?: number;
};

// ========== BUFF ==========

export type BuffSpec = ModifierBaseSpec & {
  affect: ModAffectType;
  effects?: BonusSpec | BonusSpec[];
};

// ========== DEBUFF ==========

export type DebuffSpec = ModifierBaseSpec & {
  effects?: PenaltySpec | PenaltySpec[];
};

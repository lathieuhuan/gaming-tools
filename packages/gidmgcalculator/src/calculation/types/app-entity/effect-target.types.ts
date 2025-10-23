import type { AttackBonusKey, AttackBonusType, AttributeStat, BaseAttributeStat } from "../common.types";

// ========== BONUS TARGET ==========

type AttributeTargetPath = "INP_ELMT" | "OWN_ELMT" | AttributeStat | BaseAttributeStat;

type AttributeTarget = {
  module: "ATTR";
  path: AttributeTargetPath | AttributeTargetPath[];
  /** Input's index to get element's index if path is 'INP_ELMT'. Default 0 */
  inpIndex?: number;
};
type AttackBonusTarget = {
  module: AttackBonusType | AttackBonusType[];
  path: AttackBonusKey;
};

export type EntityBonusTargets = AttributeTarget | AttackBonusTarget | AttackBonusTarget[];

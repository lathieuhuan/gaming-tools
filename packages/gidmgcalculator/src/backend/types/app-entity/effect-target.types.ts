import type { AttackBonusKey, AttackBonusType, AttributeStat } from "../common.types";

// ========== BONUS TARGET ==========

type AttributeTargetPath = "INP_ELMT" | "OWN_ELMT" | AttributeStat;

type AttributeTarget = {
  module: "ATTR";
  path: AttributeTargetPath | AttributeTargetPath[];
  /** Input's index to get element's index if path is 'INP_ELMT'. Default to 0 */
  inpIndex?: number;
};
type AttackBonusTarget = {
  module: "ELMT_NA" | AttackBonusType | AttackBonusType[];
  path: AttackBonusKey;
};

type EntityBonusTarget = AttributeTarget | AttackBonusTarget;

export type EntityBonusTargets = EntityBonusTarget | EntityBonusTarget[];

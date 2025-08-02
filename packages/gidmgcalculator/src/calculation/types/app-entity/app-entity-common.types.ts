import type { TalentType } from "../common.types";

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C4" | "C6";

export type EntityBonusBasedOnField = "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";

export type EntityBonusBasedOnConfig = {
  field: EntityBonusBasedOnField;
  /** actual stat = total stat - baseline */
  baseline?: number;
  /**
   * When this bonus is from teammate, this is input's index to get value.
   * On characters. Default to 0
   */
  altIndex?: number;
};

export type EntityBonusBasedOn = EntityBonusBasedOnField | EntityBonusBasedOnConfig;

// ========== CHARACTER EXCLUSIVE ==========

export type CharacterEffectLevelScale = {
  talent: TalentType;
  /** If [value] = 0: buff value * level. Otherwise buff value * TALENT_LV_MULTIPLIERS[value][level]. */
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default to 0 */
  altIndex?: number;
  /** On Raiden */
  max?: number;
};

export type CharacterEffectLevelIncrement = {
  talent: TalentType;
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default to 0 */
  altIndex?: number;
};

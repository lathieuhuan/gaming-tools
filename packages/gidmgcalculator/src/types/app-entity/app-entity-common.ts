import type { LevelableTalentType, TalentType } from "../common";

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C4" | "C6";

export type PartyMilestone = "SECRET_RITE";

export type EntityBonusBasedOnField = "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";

export type EntityBonusBasedOnConfig = {
  field: EntityBonusBasedOnField;
  /** actual stat = total stat - baseline */
  baseline?: number;
  /**
   * When this bonus is from teammate, this is input's index to get value.
   * On characters. Default 0
   */
  altIndex?: number;
};

export type EntityBonusBasedOn = EntityBonusBasedOnField | EntityBonusBasedOnConfig;

export type TalentLevelScaleConfig = {
  talent: LevelableTalentType;
  /** When this bonus is from teammate, this is input's index to check granted. Default 0 */
  altIndex?: number;
};

// ========== CHARACTER EXCLUSIVE ==========

export type CharacterEffectLevelScale = TalentLevelScaleConfig & {
  /**
   * - If 0, scaleValue = level * value.
   * - Otherwise, scaleValue = TALENT_LV_MULTIPLIERS[value][level].
   */
  value: number;
  /** On Raiden */
  max?: number;
};

export type CharacterEffectLevelIncrement = {
  talent: TalentType;
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default 0 */
  altIndex?: number;
};

import type { LevelableTalentType } from "../common";

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

export type TeamMilestone = "MOONSIGN" | "WITCH_RITE";

export type BonusAttributeBase = "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";

export type BonusAttributeBaseSpec =
  | BonusAttributeBase
  | {
      field: BonusAttributeBase;
      /** actual stat = total stat - baseline */
      baseline?: number;
      /**
       * When this bonus is from teammate, this is input's index to get value.
       * On characters. Default 0
       */
      altIndex?: number;
      /** Default true. */
      isDynamic?: boolean;
    };

export type TalentLevelScaleSpec = {
  talent: LevelableTalentType;
  /** When this bonus is from teammate, this is input's index to check granted. Default 0 */
  altIndex?: number;
};

// ========== CHARACTER EXCLUSIVE ==========

export type CharacterEffectLevelScale = TalentLevelScaleSpec & {
  /**
   * scaleValue = TALENT_LV_MULTIPLIERS[value][level].
   */
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

export type CharacterEffectLevelIncrement = TalentLevelScaleSpec & {
  value: number;
  changes?: {
    value: number;
    startAt: number;
  };
};

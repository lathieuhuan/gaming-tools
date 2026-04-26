import type { LevelableTalentType } from "../common";

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

export type TeamMilestone = "MOONSIGN" | "WITCH_RITE";

export type BonusScalingAttribute = "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";

export type BonusAttributeScalingSpec =
  | BonusScalingAttribute
  | {
      field: BonusScalingAttribute;
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

// ========== CHARACTER EXCLUSIVE ==========

export type TalentLevelIncrementBaseSpec = {
  talent: LevelableTalentType;
  /** When this bonus is from teammate, this is input's index to check granted. Default 0 */
  altIndex?: number;
};

type TalentLevelScaleSpec = TalentLevelIncrementBaseSpec & {
  /**
   * scaleValue = TALENT_LV_MULTIPLIERS[scale][level].
   */
  scale: 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

type TalentLevelLinearSpec = TalentLevelIncrementBaseSpec & {
  value: number;
  changes?: {
    value: number;
    startAt: number;
  };
};

export type TalentLevelIncrementSpec = TalentLevelScaleSpec | TalentLevelLinearSpec;

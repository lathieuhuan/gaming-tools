import type { ElementType, EnhanceType, Nation, WeaponType } from "../common";
import type { CharacterMilestone } from "./app-entity-common";

export type ConditionComparison = "EQUAL" | "MIN" | "MAX";

// ===== Team Conditions =====

export type TeamElementConditions = {
  /** ['pyro', 'pyro'] => 1. On Ballad of the Fjords */
  teamTotalElmtCount?: {
    value: number;
    /** Default all elements */
    elements?: ElementType[];
    comparison: ConditionComparison;
  };
  /** ['pyro', 'pyro'] => 2. On Xilonen */
  teamElmtTotalCount?: {
    value: number;
    elements: ElementType[];
    comparison: ConditionComparison;
  };
  /** On Gorou, Nilou, Chevreuse */
  teamEachElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  teamOnlyElmts?: ElementType[];
};

export type TeamMilestoneType = "MOONSIGN" | "WITCH_RITE";

export type TeamMilestoneCondition =
  | TeamMilestoneType
  | {
      type: TeamMilestoneType;
      /** Default 2 */
      value?: number;
      /** Default 'EQUAL' */
      comparison?: ConditionComparison;
    };

export type TeamConditions = TeamElementConditions & {
  checkTeamMs?: TeamMilestoneCondition;
};

// ===== Performer Condition =====

export type EffectGrantedAtConfig = {
  value: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  altIndex?: number;
  /** Default 1, or checked */
  compareValue?: number;
  /** Default 'EQUAL' */
  comparison?: ConditionComparison;
};

export type EffectGrantedAt = CharacterMilestone | EffectGrantedAtConfig;

export type EffectPerformerConditions = {
  grantedAt?: EffectGrantedAt;
  beEnhanced?: boolean;
  /** Special for Chain Breaker (bow) */
  checkMixed?: boolean;
};

// ===== Input Condition =====

/**
 * For the buff/bonus to be available, the input at the [inpIndex]
 * must meet [value] by [comparison] type.
 */
export type InputCheck = {
  value: number;
  /** The index of input to check. Default 0. */
  inpIndex?: number;
  /** Default 'EQUAL' */
  comparison?: ConditionComparison;
};

export type MultipleInputCheck = {
  relation: "AND" | "OR";
  checks: (number | InputCheck)[];
};

export type EffectInputCondition = number | InputCheck | MultipleInputCheck;

export type EffectInputConditions = {
  /** If number, the input at 0 must equal to the number */
  checkInput?: EffectInputCondition;
};

// ===== Receiver Condition =====

export type EffectReceiverConditions = {
  forNation?: Nation;
  /** On Chongyun, 2 original artifacts */
  forWeapons?: WeaponType[];
  /** On Chevreuse, Xilonen */
  forElmts?: ElementType[];
  /** On outlander weapon series */
  forName?: string;
  /** On Moonweaver's Dawn */
  forEnergyCap?: {
    value: number;
    comparison: ConditionComparison;
  };
  forEnhance?: EnhanceType;
};

// ===== Conclusion =====

export type EffectPerformableCondition = TeamConditions &
  EffectPerformerConditions &
  EffectInputConditions;

export type EffectCondition = EffectPerformableCondition & EffectReceiverConditions;

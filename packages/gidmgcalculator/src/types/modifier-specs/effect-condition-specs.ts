import type { ElementType, EnhanceType, Nation, WeaponType } from "../common";
import type { CharacterMilestone, TeamMilestone } from "./common-specs";

export type ConditionComparison = "EQUAL" | "MIN" | "MAX";

// ===== Team Conditions =====

export type TeamElementConditionSpecs = {
  /** ['pyro', 'pyro'] => 1. On Ballad of the Fjords */
  teamTotalElmtCount?: {
    value: number;
    /** Default all elements */
    elements?: ElementType[];
    comparison: ConditionComparison;
  };
  /** ['pyro', 'pyro'] => 2 */
  teamElmtTotalCount?: {
    value: number;
    elements: ElementType[];
    comparison: ConditionComparison;
  };
  /** On Gorou, Nilou, Chevreuse */
  teamEachElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  teamOnlyElmts?: ElementType[];
  /** Temporary */
  varkaPHEC?: "AND" | "OR";
};

export type TeamMilestoneConditionSpec =
  | TeamMilestone
  | {
      type: TeamMilestone;
      /** Default 2 */
      value?: number;
      /** Default 'EQUAL' */
      comparison?: ConditionComparison;
    };

export type TeamConditionSpecs = TeamElementConditionSpecs & {
  checkTeamMs?: TeamMilestoneConditionSpec;
};

// ===== Performer Condition =====

type SelfMilestoneConditionSpec =
  | CharacterMilestone
  | {
      value: CharacterMilestone;
      /** When this bonus is from teammate, this is input's index to check granted. */
      altIndex?: number;
      /** Default 1, or checked */
      compareValue?: number;
      /** Default 'EQUAL' */
      comparison?: ConditionComparison;
    };

export type EffectPerformerConditionSpecs = {
  grantedAt?: SelfMilestoneConditionSpec;
  beEnhanced?: boolean;
  /** Special for Chain Breaker (bow) */
  checkMixed?: boolean;
};

// ===== Input Condition =====

/**
 * For the buff/bonus to be available, the input at the [inpIndex]
 * must meet [value] by [comparison] type.
 */
export type InputCheckSpec = {
  value: number;
  /** The index of input to check. Default 0. */
  inpIndex?: number;
  /** Default 'EQUAL' */
  comparison?: ConditionComparison;
};

export type MultipleInputCheckSpec = {
  relation: "AND" | "OR";
  checks: (number | InputCheckSpec)[];
};

export type EffectInputConditionSpec = number | InputCheckSpec | MultipleInputCheckSpec;

export type EffectInputConditionSpecs = {
  /** If number, the input at 0 must equal to the number */
  checkInput?: EffectInputConditionSpec;
};

// ===== Performable Condition =====

export type EffectPerformableConditionSpecs = TeamConditionSpecs &
  EffectPerformerConditionSpecs &
  EffectInputConditionSpecs & {
    checkAny?: EffectPerformableConditionSpecs[];
  };

// ===== Receiver Condition =====

export type EffectReceiverConditionSpecs = {
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

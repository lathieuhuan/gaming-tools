import type { ElementType, WeaponType } from "../common.types";
import type { CharacterMilestone } from "./app-entity-common.types";

export type ConditionComparison = "EQUAL" | "MIN" | "MAX";

/**
 * For the buff/bonus to be available, the input at the [inpIndex]
 * must meet [value] by [comparison] type.
 */
export type InputCheck = {
  value: number;
  /** The index of input to check. Default to 0. */
  inpIndex?: number;
  /** Default to 'EQUAL' */
  comparison?: ConditionComparison;
};

export type EffectGrantedAt =
  | CharacterMilestone
  | {
      value: CharacterMilestone;
      /** When this bonus is from teammate, this is input's index to check granted. */
      altIndex?: number;
      /** Default to 1, or checked */
      compareValue?: number;
      /** Default to 'EQUAL' */
      comparison?: ConditionComparison;
    };

export type TeamElementCondition = {
  /** ['pyro', 'pyro'] => 1. On Ballad of the Fjords */
  teamTotalElmtCount?: {
    value: number;
    /** Default to all elements */
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

export type CharacterPropertyCondition = {
  /** On Chongyun, 2 original artifacts */
  forWeapons?: WeaponType[];
  /** On Chevreuse, Xilonen */
  forElmts?: ElementType[];
  /** On outlander weapon series */
  forName?: string;
};

export type EffectInputCondition = number | InputCheck | InputCheck[];

export type PartyPropertyCondition = {
  value: number;
  type: "MIXED" | "MOONSIGN";
  /** Default to 'EQUAL' */
  comparison?: ConditionComparison;
};

export type EffectApplicableCondition = TeamElementCondition &
  CharacterPropertyCondition & {
    /** On characters */
    grantedAt?: EffectGrantedAt;
    /** If number, the input at 0 must equal to the number */
    checkInput?: EffectInputCondition;
    /** On Chain Breaker. */
    checkParty?: PartyPropertyCondition;
  };

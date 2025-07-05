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

export type EffectUsableCondition = {
  /** If number, the input at 0 must equal to the number */
  checkInput?: number | InputCheck | InputCheck[];
  /**
   * 'DISTINCT_ELMT' only on Ballad of the Fjords.
   * 'MIXED' only on Chain Breaker.
   */
  checkParty?: {
    value: number;
    type: "DISTINCT_ELMT" | "MIXED";
    /** Default to 'EQUAL' */
    comparison?: ConditionComparison;
  };
};

type CharacterEffectAvailableCondition = {
  grantedAt?: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  altIndex?: number;
};

export type PartyElementCondition = {
  /** On Xilonen */
  totalPartyElmtCount?: {
    elements: ElementType[];
    value: number;
    comparison: "MAX";
  };
  /** On Gorou, Nilou, Chevreuse */
  partyElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  partyOnlyElmts?: ElementType[];
};

type ExtraCondition = {
  /** On Chongyun, 2 original artifacts */
  forWeapons?: WeaponType[];
  /** On Chevreuse, Xilonen */
  forElmts?: ElementType[];
};

export type EffectApplicableCondition = EffectUsableCondition &
  CharacterEffectAvailableCondition &
  PartyElementCondition &
  ExtraCondition;

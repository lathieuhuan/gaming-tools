import { ElementType, WeaponType } from "../common.types";

/**
 * For the buff/bonus to be available, the input at the [source] must meet [value] by [type].
 * On CharacterBonus & WeaponBonus
 */
export type InputCheck = {
  value: number;
  /**
   * 'mixed' only on Chain Breaker.
   * Default to 0.
   */
  source?: number | "various_vision" | "mixed";
  /** Default to 'equal' */
  type?: "equal" | "min" | "max";
};

type EffectUsableCondition = {
  /** If number, the input at 0 must equal to the number */
  checkInput?: number | InputCheck;
  /** On Xilonen */
  checkChar?: {
    type: "vision";
    value: ElementType;
  };
};

export type CharacterMilestone = "A1" | "A4" | "C1" | "C2" | "C4" | "C6";

type CharacterEffectAvailableCondition = {
  grantedAt?: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  alterIndex?: number;
};

/** Mostly on characters */
type ExtraCondition = {
  /** On Chongyun, 2 original artifacts */
  forWeapons?: WeaponType[];
  /** On Chevreuse */
  forElmts?: ElementType[];
  /** On Xilonen */
  totalPartyElmtCount?: {
    elements: ElementType[];
    value: number;
    type: "max";
  };
  /** On Gorou, Nilou, Chevreuse */
  partyElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  partyOnlyElmts?: ElementType[];
};

export type EffectApplicableCondition = EffectUsableCondition & CharacterEffectAvailableCondition & ExtraCondition;

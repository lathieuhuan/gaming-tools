import type { CharacterMilestone, ElementType, Talent, WeaponType } from "@Src/types";
import type { AppBonus, AppBonusAttributeStack, AppBonusNationStack, AppBuff, InputCheck } from "./app-common.types";

// ========== CONDITIONS ==========

type CharacterEffectAvailableCondition = {
  grantedAt?: CharacterMilestone;
  /** When this bonus is from teammate, this is input's index to check granted. */
  alterIndex?: number;
};

type CharacterEffectUsableCondition = CharacterEffectAvailableCondition & {
  checkInput?: number | InputCheck;
};

type CharacterEffectOtherUsableCondition = {
  /** On Chongyun */
  forWeapons?: WeaponType[];
  /** On Chevreuse */
  forElmts?: ElementType[];
  /** On Gorou, Nilou, Chevreuse */
  partyElmtCount?: Partial<Record<ElementType, number>>;
  /** On Nilou, Chevreuse */
  partyOnlyElmts?: ElementType[];
};

// ========== BONUS STACKS ==========

type InputStack = {
  type: "INPUT";
  /** Default to 0 */
  index?: number;
  /** When this bonus is from teammate, this is input's index to get stacks. */
  alterIndex?: number;
  /** On Wanderer */
  // #to-check: why not use max on CharacterBonusStack
  capacity?: {
    value: number;
    extra: CharacterEffectUsableCondition & {
      value: number;
    };
  };
};
type AttributeStack = AppBonusAttributeStack & {
  /** When this bonus is from teammate, this is input's index to get value. Default to 0 */
  alterIndex?: number;
};
type EnergyStack = {
  /** On Raiden Shogun */
  type: "ENERGY";
};
type ResolveStack = {
  /** On Raiden Shogun */
  type: "RESOLVE";
};

type CharacterBonusStack = (InputStack | AttributeStack | AppBonusNationStack | EnergyStack | ResolveStack) & {
  /** Final stack = stack - required base */
  baseline?: number;
  /** On Furina */
  extra?: CharacterEffectAvailableCondition & {
    value: number;
  };
  /** Dynamic on Mika */
  max?: CharacterEffectMax;
};

// ========== MAX ==========

type CharacterEffectExtraMax = CharacterEffectUsableCondition & {
  value: number;
};

type CharacterEffectDynamicMax = {
  value: number;
  /** On Hu Tao */
  stacks?: CharacterBonusStack;
  extras?: CharacterEffectExtraMax | CharacterEffectExtraMax[];
};

type CharacterEffectMax = number | CharacterEffectDynamicMax;

// ========== BONUS ==========

type CharacterEffectLevelScale = {
  talent: Talent;
  /** If [value] = 0: buff value * level. Otherwise buff value * TALENT_LV_MULTIPLIERS[value][level]. */
  value: number;
  /** When this bonus is from teammate, this is input's index to get level. Default to 0 */
  alterIndex?: number;
  /** On Raiden */
  max?: number;
};

type CharacterEffectValueOption = {
  /** On Navia */
  preOptions?: number[];
  options: number[];
  indexSrc:
    | {
        type: "ELEMENT";
        elementType: "various" | ElementType | ElementType[];
      }
    | {
        /** On Neuvillette */
        type: "INPUT";
        index?: number;
      }
    | {
        /** On Razor */
        type: "LEVEL";
        talent: Talent;
      };
  /** Add to indexSrc. On Nahida */
  extra?: {
    value: number;

    grantedAt?: CharacterMilestone;
    /** When this bonus is from teammate, this is input's index to check granted. */
    alterIndex?: number;
  };
  /** Max index. Dynamic on Navia */
  // max?: number | CharacterEffectDynamicMax;
};

type CharacterBonusExtends = {
  value: number | CharacterEffectValueOption;
  /** Multiplier based on talent level */
  lvScale?: CharacterEffectLevelScale;
  /** Added before stacks, after scale */
  preExtra?: number | Omit<CharacterBonus, "targets">;
  /** Index of pre-calculated stack */
  stackIndex?: number;
  max?: CharacterEffectMax;
};

type CharacterBonus = AppBonus<CharacterBonusStack> &
  CharacterEffectAvailableCondition &
  CharacterEffectOtherUsableCondition &
  CharacterBonusExtends;

type CharacterBuff = AppBuff<CharacterBonus> & {
  src: string;
  grantedAt?: CharacterMilestone;
  description: string;
  cmnStacks?: CharacterBonus["stacks"];
  infuseConfig?: {
    checkInput?: number | InputCheck;
    overwritable: boolean;
    range?: ("NA" | "CA" | "PA")[];
    disabledNAs?: boolean;
  };
};

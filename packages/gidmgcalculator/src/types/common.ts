import type TypeCounter from "@/utils/TypeCounter";
import type {
  AMPLIFYING_REACTIONS,
  ARTIFACT_TYPES,
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  BASE_ATTRIBUTE_STATS,
  BONUS_KEYS,
  CORE_STAT_TYPES,
  ELEMENT_TYPES,
  LEVELABLE_TALENT_TYPES,
  LEVELS,
  LUNAR_REACTIONS,
  LUNAR_TYPES,
  NORMAL_ATTACKS,
  QUICKEN_REACTIONS,
  STELLAR_REACTIONS,
  STELLAR_TYPES,
  TALENT_TYPES,
  TRANSFORMATIVE_REACTIONS,
  WEAPON_TYPES,
} from "../constants";

export type Nation =
  | "nodkrai"
  | "outland"
  | "mondstadt"
  | "liyue"
  | "inazuma"
  | "sumeru"
  | "natlan"
  | "fontaine"
  | "snezhnaya";

export type WeaponType = (typeof WEAPON_TYPES)[number];

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export type TalentType = (typeof TALENT_TYPES)[number];

export type LevelableTalentType = (typeof LEVELABLE_TALENT_TYPES)[number];

export type AttackBonusKey = (typeof BONUS_KEYS)[number];

export type Level = (typeof LEVELS)[number];

export type EnhanceType = "MOONSIGN" | "HEXEREI" | "REVELATION";

// ========== ELEMENTS ==========

export type ElementType = (typeof ELEMENT_TYPES)[number];

export type AutoRsnElmtType = "pyro" | "hydro" | "geo" | "dendro";
export type ManualRsnElmType = "cryo" | "geo" | "dendro";

export type AttackElement = (typeof ATTACK_ELEMENTS)[number];

export type ActualAttackElement = AttackElement | "absorb";

// ========== PATTERN ==========

export type NormalAttack = (typeof NORMAL_ATTACKS)[number];

export type AttackPattern = (typeof ATTACK_PATTERNS)[number];

export type ActualAttackPattern = AttackPattern | "none";

export type LunarType = (typeof LUNAR_TYPES)[number];

export type StellarType = (typeof STELLAR_TYPES)[number];

export type SpecialAttackPattern = LunarType | StellarType;

//

export type TalentCalcItemBonusId = `id.${number}`;

export type AttackBonusType =
  | "all"
  | LunarType
  | StellarType
  | SwirlVariant
  | AttackPattern
  | AttackElement
  | `${AttackPattern}.${AttackElement | LunarType | StellarType}`
  | ReactionType
  | TalentCalcItemBonusId;

export type CalcItemType = "attack" | "healing" | "shield" | "other";

export type CalcItemBasedOn = "atk" | "def" | "hp" | "em";

export type CalcItemFactor =
  | number
  | {
      root: number;
      /** On characters only: When 0 stat not scale off talent level */
      scale?: number;
      /** On weapons only: multiplied by refi. Default 1/3 [root] */
      incre?: number;
      /** Default 'atk' */
      basedOn?: CalcItemBasedOn;
    };

// ========== REACTIONS ==========

export type AmplifyingReaction = (typeof AMPLIFYING_REACTIONS)[number];

export type SwirlVariant = `swirl.${ElementType}`;

export type TransformativeReaction = (typeof TRANSFORMATIVE_REACTIONS)[number];

export type QuickenReaction = (typeof QUICKEN_REACTIONS)[number];

export type LunarReaction = (typeof LUNAR_REACTIONS)[number];

export type StellarReaction = (typeof STELLAR_REACTIONS)[number];

export type ReactionType =
  | TransformativeReaction
  | LunarReaction
  | StellarReaction
  | QuickenReaction
  | AmplifyingReaction;

// ========== RESISTANCE REDUCTION ==========

export type ResistReductionKey = AttackElement | "def";
export type ResistReduction = Record<ResistReductionKey, number>;

//

export type CoreStat = (typeof CORE_STAT_TYPES)[number];

export type BaseAttributeStat = (typeof BASE_ATTRIBUTE_STATS)[number];

export type AttributeStat = (typeof ATTRIBUTE_STAT_TYPES)[number];

export type ElementCount = TypeCounter<ElementType>;

export type AllAttributeStat = AttributeStat | BaseAttributeStat;

export type AllAttributes = TypeCounter<AllAttributeStat>;

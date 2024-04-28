export { default as getCalculationStats } from "./calculation/getCalculationStats";
export { calculateSetup } from "./calculation/calculateSetup";
export { getIntialBonusValue } from "./calculation/getCalculationStats/applyCharacterBuff";
export { CharacterCalc, WeaponCalc, ArtifactCalc, GeneralCalc } from "./calculation/utils";
export { ArtifactAttributeControl, TrackerControl } from "./calculation/controls";

export {
  LEVELS,
  ATTACK_PATTERNS,
  TALENT_TYPES,
  ELEMENT_TYPES,
  ATTACK_ELEMENTS,
  CORE_STAT_TYPES,
  NORMAL_ATTACKS,
  TRANSFORMATIVE_REACTIONS,
  ARTIFACT_TYPES,
  WEAPON_TYPES,
  ATTRIBUTE_STAT_TYPES,
  ATTACK_PATTERN_INFO_KEYS,
  REACTIONS,
  ATTACK_ELEMENT_INFO_KEYS,
  REACTION_BONUS_INFO_KEYS,
} from "./constants";

export type {
  AppCharacter,
  ModInputType,
  ModifierAffectType,
  AppWeapon,
  AppArtifact,
  Level,
  LevelableTalentType,
  ElementType,
  ArtifactAttribute,
  WeaponType,
  TalentType,
  ArtifactType,
  CoreStat,
  AttributeStat,
  TotalAttribute,
  NormalAttack,
  TransformativeReaction,
  ModInputConfig,
  AmplifyingReaction,
  QuickenReaction,
  ArtifactModifierDescription,
  ReactionBonus,
  CharacterBuff,
  CalcItem,
  WeaponBuff,
  ReactionType,
  CharacterDebuff,
  AttackElement,
  AttackPatternBonusKey,
  AttackElementInfoKey,
  AttackPatternInfoKey,
  AttackPattern,
  ReactionBonusInfoKey,
  ResistanceReductionKey,
  ResistanceReduction,
} from "./types";
export type {
  CalculationAspect,
  CalculationFinalResult,
  CalculationFinalResultGroup,
  CalcItemRecord,
} from "./calculation/calculation.types";
export type { ArtifactSetBonus } from "./calculation/utils";
export type { TrackerResult, StatRecord } from "./calculation/controls";
export type { AppMonster } from "./types/app-monster.types";

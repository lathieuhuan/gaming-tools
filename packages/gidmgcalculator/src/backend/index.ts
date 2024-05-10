export { calculateSetup } from "./calculation/calculateSetup";
export { default as getCalculationStats } from "./calculation/getCalculationStats";
export { getIntialBonusValue } from "./calculation/getCalculationStats/applier-character-buff";
export { ArtifactAttributeControl, TrackerControl } from "./calculation/controls";
export {
  ArtifactCalc,
  CharacterCalc,
  EntityCalc,
  GeneralCalc,
  WeaponCalc,
  type ArtifactSetBonus,
} from "./calculation/utils";

export * from "./constants";

export type {
  ArtifactAttribute,
  CalculationAspect,
  CalculationFinalResult,
  CalculationFinalResultGroup,
  TotalAttribute,
} from "./calculation/calculation.types";
export type { CalcItemRecord, CalcStatRecord, TrackerResult, AttackBonus } from "./calculation/controls";
export type {
  AmplifyingReaction,
  AppArtifact,
  AppCharacter,
  AppWeapon,
  ArtifactModifierDescription,
  ArtifactType,
  AttackElement,
  AttackPattern,
  AttributeStat,
  BonusKey,
  CalcItem,
  CharacterBuff,
  CharacterDebuff,
  CoreStat,
  ElementType,
  Level,
  LevelableTalentType,
  ModInputConfig,
  ModInputType,
  ModifierAffectType,
  NormalAttack,
  QuickenReaction,
  ReactionBonus,
  ReactionType,
  ResistanceReduction,
  ResistanceReductionKey,
  TalentType,
  TransformativeReaction,
  WeaponBuff,
  WeaponType,
} from "./types";
export type { AppMonster } from "./types/app-monster.types";

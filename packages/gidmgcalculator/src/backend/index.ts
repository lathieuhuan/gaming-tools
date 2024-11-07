export { BuffApplierCore } from "./appliers/buff-applier-core";
export { getIntialCharacterBonusValue } from "./bonus-getters";
export {
  AttackPatternConf,
  CalcItemCalculator,
  getNormalsConfig,
  type CalculationAspect,
  type NormalsConfig,
} from "./calculation";
export { calculateSetup } from "./calculation-calculator/calculateSetup";
export { default as getCalculationStats } from "./calculation-calculator/getCalculationStats";
export { AttackBonusControl, ResistanceReductionControl, TotalAttributeControl, TrackerControl } from "./controls";
export {
  ArtifactCalc,
  CharacterCalc,
  EntityCalc,
  GeneralCalc,
  WeaponCalc,
  type ArtifactSetBonus,
  type CalculationInfo,
} from "./common-utils";

export * from "./constants";

export type {
  ArtifactAttribute,
  AttackBonuses,
  CalcAtomicRecord,
  CalcItemRecord,
  TotalAttribute,
  TrackerResult,
} from "./controls";
export type {
  ActualAttackPattern,
  AmplifyingReaction,
  AppArtifact,
  AppCharacter,
  AppMonster,
  AppWeapon,
  ArtifactModifierDescription,
  ArtifactType,
  AttackBonusKey,
  AttackBonusType,
  AttackElement,
  AttackPattern,
  AttributeStat,
  CalcItem,
  CharacterBuff,
  CharacterDebuff,
  CharacterMilestone,
  CoreStat,
  ElementType,
  Level,
  LevelableTalentType,
  ModInputConfig,
  ModInputType,
  ModifierAffectType,
  NormalAttack,
  QuickenReaction,
  ReactionType,
  ResistanceReduction,
  ResistanceReductionKey,
  TalentType,
  TransformativeReaction,
  WeaponBuff,
  WeaponType,
} from "./types";

export type { AppliedAttackBonus, AppliedAttributeBonus } from "./appliers/appliers.types";
export type { CalculationFinalResult, CalculationFinalResultGroup } from "./calculation-calculator/getFinalResult";

export { calculateSetup } from "./calculation/calculateSetup";
export { default as getCalculationStats } from "./calculation/getCalculationStats";
export { getIntialBonusValue } from "./calculation/getCalculationStats/applier-character-buff";
export { calcArtifactAtribute } from "./calculation/getCalculationStats/getCalculationStats.utils";
export { TrackerControl, AttackBonusControl } from "./calculation/controls";
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
export type { CalcItemRecord, CalcAtomicRecord, TrackerResult, AttackBonus } from "./calculation/controls";
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
  AttackBonusKey,
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
  ReactionType,
  ResistanceReduction,
  ResistanceReductionKey,
  TalentType,
  TransformativeReaction,
  WeaponBuff,
  WeaponType,
} from "./types";
export type { AppMonster } from "./types/app-monster.types";

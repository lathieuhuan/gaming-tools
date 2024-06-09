export { calculateSetup } from "./calculation/calculateSetup";
export { default as getCalculationStats } from "./calculation/getCalculationStats";
export { getIntialCharacterBonusValue } from "./bonus-getters";
export { TrackerControl, TotalAttributeControl, AttackBonusControl } from "./controls";
export { ArtifactCalc, CharacterCalc, EntityCalc, GeneralCalc, WeaponCalc, type ArtifactSetBonus } from "./utils";

export * from "./constants";

export type {
  CalculationAspect,
  CalculationFinalResult,
  CalculationFinalResultGroup,
} from "./calculation/calculation.types";
export type {
  CalcItemRecord,
  CalcAtomicRecord,
  TrackerResult,
  AttackBonus,
  ArtifactAttribute,
  TotalAttribute,
} from "./controls";
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

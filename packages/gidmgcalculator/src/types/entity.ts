import type { AppArtifact } from "./app-artifact";
import type { AppCharacter } from "./app-character";
import type { AppMonster } from "./app-monster";
import type { AppWeapon } from "./app-weapon";
import type {
  ArtifactType,
  AttackElement,
  AttributeStat,
  ElementType,
  Level,
  TotalAttributes,
  WeaponType,
} from "./common";

// ========== WEAPON ==========

export type IWeaponBasic = {
  ID: number;
  code: number;
  type: WeaponType;
  level: Level;
  refi: number;
};

export type IWeapon = IWeaponBasic & {
  data: AppWeapon;
};

// ========== ARTIFACT ==========

export type ArtifactSubStat = {
  type: AttributeStat;
  value: number;
};

export type IArtifactBasic = {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
};

export type IArtifact = IArtifactBasic & {
  data: AppArtifact;
};

export type IArtifactGearSet = {
  bonusLv: number;
  pieceCount: number;
  data: AppArtifact;
};

export type IArtifactGearPieces<T extends IArtifact = IArtifact> = Partial<
  Record<ArtifactType, T>
> &
  Iterable<T>;

export type IArtifactGear<T extends IArtifact = IArtifact> = {
  pieces: IArtifactGearPieces<T>;
  sets: IArtifactGearSet[];
  attributes: TotalAttributes;
};

// ========== CHARACTER ==========

export type ICharacterBasic = {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;
};

export type ICharacter<
  TWeapon extends IWeapon = IWeapon,
  TArtifact extends IArtifactGear = IArtifactGear
> = ICharacterBasic & {
  // data: AppCharacter;
  weapon: TWeapon;
  artifact: TArtifact;
};

// ========== TEAMMATE ==========

export type ITeammateWeaponBasic = {
  code: number;
  type: WeaponType;
  refi: number;
};

export type ITeammateArtifactBasic = {
  code: number;
};

// ========== TARGET ==========

export type ITargetBasic = {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;
};

export type ITarget = ITargetBasic & {
  data: AppMonster;
};

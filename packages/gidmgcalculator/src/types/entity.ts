import type { AppArtifact } from "./app-artifact";
import type { AppMonster } from "./app-monster";
import type {
  ArtifactType,
  AttackElement,
  AttributeStat,
  ElementType,
  Level,
  WeaponType,
} from "./common";
import type { ModifierCtrlState } from "./modifier-controls";

export type EquipmentRelation = {
  owner?: number;
  setupIDs?: number[];
};

// ========== WEAPON ==========

export type RawWeaponState = {
  level: Level;
  refi: number;
};

export type RawWeapon = RawWeaponState &
  EquipmentRelation & {
    ID: number;
    code: number;
    type: WeaponType;
  };

// ========== ARTIFACT ==========

export type ArtifactSubStat = {
  type: AttributeStat;
  value: number;
};

export type RawArtifactState = {
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
};

export type RawArtifact = RawArtifactState &
  EquipmentRelation & {
    ID: number;
    code: number;
  };

export type ArtifactGearSet = {
  bonusLv: number;
  pieceCount: number;
  data: AppArtifact;
};

//

export type RawItem = RawWeapon | RawArtifact;

// ========== CHARACTER ==========

export type CharacterStateData = {
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;
};

export type RawCharacter = CharacterStateData & {
  code: number;
};

// ========== TEAMMATE ==========

export type TeammateWeaponState = {
  code: number;
  type: WeaponType;
  refi: number;
};

export type TeammateArtifactState = {
  code: number;
};

export type RawTeammateState = {
  code: number;
  enhanced: boolean;
};

export type RawTeammate = RawTeammateState & {
  buffCtrls: ModifierCtrlState[];
  debuffCtrls: ModifierCtrlState[];
  weapon: TeammateWeaponState & {
    buffCtrls: ModifierCtrlState[];
  };
  artifact?: TeammateArtifactState & {
    buffCtrls: ModifierCtrlState[];
  };
};

// ========== TARGET ==========

export type RawTarget = {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;
};

export type TargetData = RawTarget & {
  data: AppMonster;
};

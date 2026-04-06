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
import {
  CustomBuffCtrl,
  CustomDebuffCtrl,
  ElementalEvent,
  IArtifactModCtrlBasic,
  IModifierCtrlBasic,
  ResonanceModCtrl,
} from "./modifiers";

export type EquipmentRelationData = {
  owner?: number;
  setupIDs?: number[];
};

// ========== WEAPON ==========

export type WeaponKey = {
  ID: number;
  code: number;
  type: WeaponType;
};

export type WeaponStateData = {
  level: Level;
  refi: number;
};

export type RawWeapon = WeaponKey & WeaponStateData & EquipmentRelationData;

// ========== ARTIFACT ==========

export type ArtifactKey = {
  ID: number;
  code: number;
};

export type ArtifactSubStat = {
  type: AttributeStat;
  value: number;
};

export type ArtifactStateData = {
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
};

export type ArtifactStateKey = keyof ArtifactStateData;

export type RawArtifact = ArtifactKey & ArtifactStateData & EquipmentRelationData;

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

export type ITeammateWeaponBasic = {
  code: number;
  type: WeaponType;
  refi: number;
};

export type ITeammateArtifactBasic = {
  code: number;
};

export type ITeammateBasicCore = {
  code: number;
  enhanced: boolean;
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

// ========== SETUP ==========

export type ITeammateBasic = ITeammateBasicCore & {
  buffCtrls: IModifierCtrlBasic[];
  debuffCtrls: IModifierCtrlBasic[];
  weapon: ITeammateWeaponBasic & {
    buffCtrls: IModifierCtrlBasic[];
  };
  artifact?: ITeammateArtifactBasic & {
    buffCtrls: IModifierCtrlBasic[];
  };
};

export type ISetupBasic = {
  main: RawCharacter;
  selfBuffCtrls: IModifierCtrlBasic[];
  selfDebuffCtrls: IModifierCtrlBasic[];

  wpBuffCtrls: IModifierCtrlBasic[];
  artBuffCtrls: IArtifactModCtrlBasic[];
  artDebuffCtrls: IArtifactModCtrlBasic[];

  teammates: ITeammateBasic[];
  teamBuffCtrls: IModifierCtrlBasic[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];

  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  target: ITargetBasic;
};

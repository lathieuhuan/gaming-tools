import type { AppArtifact } from "./app-artifact";
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
import { CustomDebuffCtrl, CustomBuffCtrl, ElementalEvent, ResonanceModCtrl } from "./modifiers";
import { IArtifactModCtrlBasic } from "./modifiers";
import { IModifierCtrlBasic } from "./modifiers";

// ========== WEAPON ==========

export type IWeaponBasic = {
  ID: number;
  code: number;
  type: WeaponType;
  level: Level;
  refi: number;
  owner?: string;
  setupIDs?: number[];
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
  owner?: string;
  setupIDs?: number[];
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

export type IArtifactGearSlot<TArtifact extends IArtifact = IArtifact> =
  | {
      isFilled: true;
      type: ArtifactType;
      piece: TArtifact;
    }
  | {
      isFilled: false;
      type: ArtifactType;
    };

export type IArtifactGear<T extends IArtifact = IArtifact> = {
  pieces: IArtifactGearPieces<T>;
  slots: IArtifactGearSlot<T>[];
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
  W extends IWeapon = IWeapon,
  A extends IArtifactGear = IArtifactGear
> = ICharacterBasic & {
  weapon: W;
  atfGear: A;
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
  name: string;
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
  main: ICharacterBasic;
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

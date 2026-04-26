import type {
  ArtifactType,
  AttributeStat,
  ArtifactSubStat,
  BasicSetupType,
  Level,
  WeaponType,
  ModifierCtrlState,
  ArtifactModCtrlState,
  ResonanceModCtrl,
  ElementalEvent,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  RawTarget,
  TeammateArtifactState,
  TeammateWeaponState,
} from "@/types";

type RawCharacter = {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;
};

type IDbCharacter = RawCharacter & {
  weaponID: number;
  artifactIDs: number[];
};

export type ITeammateBasic = {
  name: string;
  enhanced: boolean;

  buffCtrls: ModifierCtrlState[];
  debuffCtrls: ModifierCtrlState[];
  weapon: TeammateWeaponState & {
    buffCtrls: ModifierCtrlState[];
  };
  artifact?: TeammateArtifactState & {
    buffCtrls: ModifierCtrlState[];
  };
};

export type IDbSetup = {
  ID: number;
  type: BasicSetupType;
  name: string;

  main: IDbCharacter;

  selfBuffCtrls: ModifierCtrlState[];
  selfDebuffCtrls: ModifierCtrlState[];

  wpBuffCtrls: ModifierCtrlState[];
  artBuffCtrls: ArtifactModCtrlState[];
  artDebuffCtrls: ArtifactModCtrlState[];

  teammates: ITeammateBasic[];
  teamBuffCtrls: ModifierCtrlState[];
  rsnBuffCtrls: ResonanceModCtrl[];
  rsnDebuffCtrls: ResonanceModCtrl[];

  elmtEvent: ElementalEvent;
  customBuffCtrls: CustomBuffCtrl[];
  customDebuffCtrls: CustomDebuffCtrl[];
  target: RawTarget;
};

type IDbComplexSetup = {
  ID: number;
  type: "complex";
  name: string;
  shownID: number;
  allIDs: Record<string, number>;
};

type IWeaponBasic = {
  ID: number;
  code: number;
  type: WeaponType;
  level: Level;
  refi: number;
  owner?: string;
  setupIDs?: number[];
};

type IArtifactBasic = {
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

export type DatabaseDataV4 = {
  version: number;
  characters: IDbCharacter[];
  weapons: IWeaponBasic[];
  artifacts: IArtifactBasic[];
  setups: (IDbSetup | IDbComplexSetup)[];
};

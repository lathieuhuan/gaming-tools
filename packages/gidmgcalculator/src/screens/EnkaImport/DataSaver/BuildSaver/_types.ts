import type { Artifact, Weapon } from "@/models/base";
import type { IArtifactBasic, ICharacterBasic, IDbCharacter, IWeaponBasic } from "@/types";
import type { GOODCharacterConvertReturn } from "@/utils/converGOOD.utils";

// ===== Saving Step =====

export type CharacterSavingStep = {
  type: "CHARACTER";
  data: GOODCharacterConvertReturn;
  current?: IDbCharacter;
};

export type WeaponSavingStep = {
  type: "WEAPON";
  data: Weapon;
  currentWeapon?: Weapon;
  sameWeapons: IWeaponBasic[];
};

export type ArtifactSavingStep = {
  type: "ARTIFACT";
  data: Artifact;
  currentArtifact?: Artifact;
  sameArtifacts: IArtifactBasic[];
};

export type SavingSteps = [CharacterSavingStep, WeaponSavingStep, ...ArtifactSavingStep[]];

// ===== Save Output =====

export type CharacterSaveOutput = {
  action: "CREATE" | "UPDATE" | "NONE";
  character: ICharacterBasic;
};

export type WeaponSaveOutput = {
  action: "CREATE" | "UPDATE" | "NONE";
  weapon: IWeaponBasic;
};

export type ArtifactSaveOutput = {
  action: "CREATE" | "UPDATE" | "NONE";
  artifact: IArtifactBasic;
};

export type SaveOutput = {
  character?: CharacterSaveOutput;
  weapon?: WeaponSaveOutput;
  artifacts?: ArtifactSaveOutput[];
};

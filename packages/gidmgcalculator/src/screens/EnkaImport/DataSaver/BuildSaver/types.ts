import type { Artifact, Weapon } from "@/models";
import type { RawArtifact, RawCharacter, IDbCharacter, RawWeapon } from "@/types";
import type { GOODCharacterConvertReturn } from "@/logic/converGOOD.logic";

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
  sameWeapons: RawWeapon[];
};

export type ArtifactSavingStep = {
  type: "ARTIFACT";
  data: Artifact;
  currentArtifact?: Artifact;
  sameArtifacts: RawArtifact[];
};

export type SavingSteps = [CharacterSavingStep, WeaponSavingStep, ...ArtifactSavingStep[]];

// ===== Save Output =====

export type CharacterSaveOutput = {
  action: "CREATE" | "UPDATE" | "NONE";
  character: RawCharacter;
};

export type WeaponSaveOutput = {
  action: "CREATE" | "UPDATE" | "NONE";
  weapon: RawWeapon;
};

export type ArtifactSaveOutput = {
  action: "CREATE" | "UPDATE" | "NONE";
  artifact: RawArtifact;
};

export type SaveOutput = {
  character?: CharacterSaveOutput;
  weapon?: WeaponSaveOutput;
  artifacts?: ArtifactSaveOutput[];
};

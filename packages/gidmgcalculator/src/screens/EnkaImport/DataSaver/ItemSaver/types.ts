import type { Artifact, Weapon } from "@/models";
import type { RawArtifact, RawWeapon } from "@/types";

export type WeaponSavingStep = {
  type: "WEAPON";
  data: Weapon;
  sameWeapons: RawWeapon[];
};

export type ArtifactSavingStep = {
  type: "ARTIFACT";
  data: Artifact;
  sameArtifacts: RawArtifact[];
};

export type ItemSavingStep = WeaponSavingStep | ArtifactSavingStep;

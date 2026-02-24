import type { Artifact, Weapon } from "@/models";
import type { IArtifactBasic, IWeaponBasic } from "@/types";

export type WeaponSavingStep = {
  type: "WEAPON";
  data: Weapon;
  sameWeapons: IWeaponBasic[];
};

export type ArtifactSavingStep = {
  type: "ARTIFACT";
  data: Artifact;
  sameArtifacts: IArtifactBasic[];
};

export type ItemSavingStep = WeaponSavingStep | ArtifactSavingStep;

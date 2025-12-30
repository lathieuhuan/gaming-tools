import type { Artifact } from "@/models/base/Artifact";
import type { Weapon } from "@/models/base/Weapon";
import type { IArtifactBasic, IWeaponBasic } from "@/types";

export type WeaponSavingStep = {
  type: "WEAPON";
  data: Weapon;
  saveStatus: "NEW" | "POSSIBLE_DUP";
  /** Weapons with same code */
  similarWeapons?: IWeaponBasic[];
};

export type ArtifactSavingStep = {
  type: "ARTIFACT";
  data: Artifact;
  saveStatus: "NEW" | "POSSIBLE_DUP";
  /** Artifacts with same code & type & rarity */
  similarArtifacts?: IArtifactBasic[];
};

export type ItemSavingStep = WeaponSavingStep | ArtifactSavingStep;

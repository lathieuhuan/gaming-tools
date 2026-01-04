import type { Artifact, Weapon } from "@/models/base";
import type { IArtifactBasic, ICharacterBasic, IDbCharacter, IWeaponBasic } from "@/types";
import type { GOODCharacterConvertReturn } from "@/utils/GOOD";

// ===== Character Saving Step =====

export type CharacterSaveConfig =
  | {
      status: "NEW";
    }
  | {
      status: "UNCHANGED" | "CHANGED";
      existedCharacter: IDbCharacter;
    };

export type CharacterSavingStep = {
  type: "CHARACTER";
  data: GOODCharacterConvertReturn;
  config: CharacterSaveConfig;
};

// ===== Weapon Saving Step =====

export type WeaponSaveConfig =
  | {
      instruct: "CONTINUABLE";
      status: "NEW" | "UNCHANGED";
    }
  | {
      instruct: "EQUIPPABLE";
      sameWeapons: IWeaponBasic[];
      currentWeapon?: Weapon;
    }
  | {
      instruct: "COMPARABLE";
      isSame: boolean;
      currentWeapon: Weapon;
    };

export type WeaponSavingStep = {
  type: "WEAPON";
  data: Weapon;
  config: WeaponSaveConfig;
};

// ===== Artifact Saving Step =====

export type ArtifactSavingStep = {
  type: "ARTIFACT";
  data: Artifact;
  sameArtifacts: IArtifactBasic[];
};

export type SavingStep = CharacterSavingStep | WeaponSavingStep | ArtifactSavingStep;

// ===== Save Output =====

export type SaveOutput = {
  character?: {
    action: "CREATE" | "UPDATE" | "NONE";
    character: ICharacterBasic;
  };
  weapon?: {
    action: "CREATE" | "UPDATE" | "NONE";
    weapon: IWeaponBasic;
  };
};

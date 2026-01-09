import isEqual from "react-fast-compare";

import type {
  ArtifactType,
  IArtifactBasic,
  ICharacterBasic,
  IDbCharacter,
  IWeaponBasic,
} from "@/types";
import type { GOODCharacterConvertReturn } from "@/utils/GOOD";
import type {
  ArtifactSavingStep,
  CharacterSaveConfig,
  WeaponSaveConfig,
  WeaponSavingStep,
} from "./_types";

import { Artifact, Weapon } from "@/models/base";
import { $AppWeapon } from "@/services";
import Object_ from "@/utils/Object";
import { GenshinUserBuild } from "@/services/enka";
import { createArtifact } from "@/utils/entity";
import { ARTIFACT_TYPES } from "@/constants";
import Array_ from "@/utils/Array";

const charComparedFields: (keyof ICharacterBasic)[] = ["level", "NAs", "ES", "EB", "cons"];

export const getCharacterSaveConfig = (
  character: GOODCharacterConvertReturn,
  userChars: IDbCharacter[]
): CharacterSaveConfig => {
  const existedCharacter = userChars.find((userChar) => userChar.name === character.basic.name);

  if (existedCharacter) {
    const unchanged = isEqual(
      Object_.pickProps(existedCharacter, charComparedFields),
      Object_.pickProps(character.basic, charComparedFields)
    );

    return {
      status: unchanged ? "UNCHANGED" : "CHANGED",
      existedCharacter,
    };
  }

  return {
    status: "NEW",
  };
};

// ===== NEW BUILD =====

export const getNewBuildWeaponSaveConfig = (
  weapon: Weapon,
  userWps: IWeaponBasic[]
): WeaponSaveConfig => {
  const sameFreeWeapons = userWps.filter((userWp) => userWp.code === weapon.code && !userWp.owner);

  if (sameFreeWeapons.length) {
    // EQUIP same weapon (can be updated if different) | ADD NEW
    return {
      instruct: "EQUIPPABLE",
      sameWeapons: sameFreeWeapons,
    };
  }

  // CONTINUE
  return {
    instruct: "CONTINUABLE",
    status: "NEW",
  };
};

const isSameArtifact = (artifact1: IArtifactBasic, artifact2: IArtifactBasic) => {
  return (
    artifact1.code === artifact2.code &&
    artifact1.type === artifact2.type &&
    artifact1.rarity === artifact2.rarity &&
    artifact1.mainStatType === artifact2.mainStatType
  );
};

export const getNewBuildArtifactSaveConfigs = (
  artifacts: GenshinUserBuild["artifacts"],
  userAtfs: IArtifactBasic[]
): ArtifactSavingStep[] => {
  const configByType = artifacts.reduce<Partial<Record<ArtifactType, ArtifactSavingStep>>>(
    (acc, artifact) => {
      if (artifact) {
        acc[artifact.type] = {
          type: "ARTIFACT",
          data: createArtifact(artifact, artifact.data),
          sameArtifacts: [],
        };
      }

      return acc;
    },
    {}
  );

  for (const userAtf of userAtfs) {
    const config = configByType[userAtf.type];

    if (config && isSameArtifact(config.data, userAtf)) {
      config.sameArtifacts.push(userAtf);
    }
  }

  return Array_.truthify(ARTIFACT_TYPES.map((type) => configByType[type]));
};

// ===== OLD BUILD =====

export const getOldBuildWeaponSaveConfig = (
  weapon: Weapon,
  userWps: IWeaponBasic[],
  currentWeaponId: number
): WeaponSaveConfig => {
  let currentWeapon: IWeaponBasic | undefined;

  const sameFreeWeapons = userWps.filter((userWp) => {
    if (userWp.ID === currentWeaponId) {
      currentWeapon = userWp;
    }

    return userWp.code === weapon.code && !userWp.owner;
  });

  if (!currentWeapon) {
    // bug: currentWeapon is missing in userWps
    return {
      instruct: "CONTINUABLE",
      status: "NEW",
    };
  }

  if (currentWeapon.code === weapon.code) {
    if (currentWeapon.level === weapon.level && currentWeapon.refi === weapon.refi) {
      // CONTINUE
      return {
        instruct: "CONTINUABLE",
        status: "UNCHANGED",
      };
    }

    // UPDATE old version | KEEP old version
    return {
      instruct: "COMPARABLE",
      isSame: true,
      currentWeapon: new Weapon(currentWeapon, weapon.data),
    };
  }

  // Current weapon is different

  const current = new Weapon(currentWeapon, $AppWeapon.get(currentWeapon.code)!);

  if (sameFreeWeapons.length) {
    // EQUIP same weapon (can be updated if different) | ADD NEW | SKIP to use current
    return {
      instruct: "EQUIPPABLE",
      sameWeapons: sameFreeWeapons,
      currentWeapon: current,
    };
  }

  // ADD & SWITCH to this weapon | SKIP to use old weapon
  return {
    instruct: "COMPARABLE",
    isSame: false,
    currentWeapon: current,
  };
};

//

export const getWeaponSavingStep = (weapon: Weapon, userWps: IWeaponBasic[]): WeaponSavingStep => {
  let currentWeapon: IWeaponBasic | undefined;

  const sameWeapons = userWps.filter((userWp) => {
    const isSameCode = userWp.code === weapon.code;

    if (isSameCode && userWp.owner === weapon.owner) {
      currentWeapon = userWp;
      return false;
    }

    return isSameCode && !userWp.owner;
  });

  return {
    type: "WEAPON",
    data: weapon,
    currentWeapon,
    sameWeapons,
  };
};

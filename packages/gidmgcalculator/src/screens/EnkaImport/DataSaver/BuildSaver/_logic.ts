import type { Weapon } from "@/models";
import type { GenshinUserBuild } from "@/services/enka";
import type { ArtifactType, IArtifactBasic, IDbCharacter, IWeaponBasic } from "@/types";
import type { GOODCharacterConvertReturn } from "@/logic/converGOOD.logic";
import type {
  ArtifactSavingStep,
  CharacterSavingStep,
  SaveOutput,
  SavingSteps,
  WeaponSavingStep,
} from "./_types";

import { ARTIFACT_TYPES } from "@/constants";
import Array_ from "@/utils/Array";
import { createArtifact, createWeapon } from "@/logic/entity.logic";
import { isSameArtifact } from "../_logic";

export const getCharacterSavingStep = (
  character: GOODCharacterConvertReturn,
  userChars: IDbCharacter[]
): CharacterSavingStep => {
  const existedCharacter = userChars.find((userChar) => userChar.code === character.basic.code);

  return {
    type: "CHARACTER",
    data: character,
    current: existedCharacter,
  };
};

export const getWeaponSavingStep = (
  weapon: GenshinUserBuild["weapon"],
  userWps: IWeaponBasic[]
): WeaponSavingStep => {
  let currentWeapon: Weapon | undefined;

  const sameWeapons = userWps.filter((userWp) => {
    const isSameCode = userWp.code === weapon.code;

    if (userWp.owner === weapon.owner) {
      currentWeapon = createWeapon(userWp);
      return false;
    }

    return isSameCode && !userWp.owner;
  });

  return {
    type: "WEAPON",
    data: createWeapon(weapon, weapon.data),
    currentWeapon,
    sameWeapons,
  };
};

export const getArtifactSavingStep = (
  artifacts: GenshinUserBuild["artifacts"],
  userAtfs: IArtifactBasic[]
): ArtifactSavingStep[] => {
  const configByType = artifacts.reduce<Partial<Record<ArtifactType, ArtifactSavingStep>>>(
    (acc, artifact) => {
      if (artifact) {
        acc[artifact.type] = {
          type: "ARTIFACT",
          data: createArtifact(artifact, artifact.data),
          currentArtifact: undefined,
          sameArtifacts: [],
        };
      }

      return acc;
    },
    {}
  );

  for (const userAtf of userAtfs) {
    const config = configByType[userAtf.type];
    if (!config) {
      continue;
    }

    if (userAtf.owner === config.data.owner) {
      config.currentArtifact = createArtifact(userAtf);
      continue;
    }

    if (isSameArtifact(config.data, userAtf)) {
      config.sameArtifacts.push(userAtf);
    }
  }

  return Array_.truthify(ARTIFACT_TYPES.map((type) => configByType[type]));
};

import { Array_ } from "ron-utils";

import type { GOODCharacterConvertReturn } from "@/logic/converGOOD.logic";
import type { Weapon } from "@/models";
import type { GenshinUserBuild } from "@/services/enka";
import type { ArtifactType, RawArtifact, IDbCharacter, RawWeapon } from "@/types";
import type { ArtifactSavingStep, CharacterSavingStep, WeaponSavingStep } from "./types";

import { ARTIFACT_TYPES } from "@/constants";
import { createArtifact, createWeapon } from "@/logic/entity.logic";
import { isSameArtifact } from "../logic";

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
  userWps: RawWeapon[]
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
  dbArtifacts: RawArtifact[]
): ArtifactSavingStep[] => {
  const configByType = artifacts.reduce<Partial<Record<ArtifactType, ArtifactSavingStep>>>(
    (acc, artifact) => {
      if (artifact) {
        acc[artifact.type] = {
          type: "ARTIFACT",
          data: createArtifact(artifact),
          currentArtifact: undefined,
          sameArtifacts: [],
        };
      }

      return acc;
    },
    {}
  );

  for (const dbArtifact of dbArtifacts) {
    const config = configByType[dbArtifact.type];
    if (!config) {
      continue;
    }

    if (dbArtifact.owner === config.data.owner) {
      config.currentArtifact = createArtifact(dbArtifact);
      continue;
    }

    if (isSameArtifact(config.data, dbArtifact)) {
      config.sameArtifacts.push(dbArtifact);
    }
  }

  return Array_.truthify(ARTIFACT_TYPES.map((type) => configByType[type]));
};

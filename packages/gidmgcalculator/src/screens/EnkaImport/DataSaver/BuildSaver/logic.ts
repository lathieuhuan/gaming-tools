import { Array_ } from "ron-utils";

import type { GOODCharacterConvertReturn } from "@/logic/converGOOD.logic";
import type { Weapon } from "@/models";
import type { GenshinUserBuild } from "@/services/enka";
import type { ArtifactType, IDbCharacter, RawArtifact, RawWeapon } from "@/types";
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
    if (userWp.owner === weapon.owner) {
      currentWeapon = createWeapon(userWp);
      return false;
    }

    return userWp.code === weapon.code && !userWp.owner;
  });

  return {
    type: "WEAPON",
    data: weapon,
    currentWeapon,
    sameWeapons,
  };
};

export const getArtifactSavingStep = (
  atfGear: GenshinUserBuild["atfGear"],
  dbArtifacts: RawArtifact[]
): ArtifactSavingStep[] => {
  const configByType = atfGear.pieces
    .list()
    .reduce<Partial<Record<ArtifactType, ArtifactSavingStep>>>((acc, artifact) => {
      acc[artifact.type] = {
        type: "ARTIFACT",
        data: artifact,
        currentArtifact: undefined,
        sameArtifacts: [],
      };

      return acc;
    }, {});

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

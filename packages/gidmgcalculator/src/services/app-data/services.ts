import type { AppCharacter } from "@/types";
import type { GenshinDevErrorResponse } from "./types";

import { LEVELABLE_TALENT_TYPES } from "@/constants";
import { $AppCharacter } from "./AppCharacterService";
import { customFetch } from "./BaseService";
import { NO_DESCRIPTION_MSG } from "./config";
import { GenshinDevData, transformGenshinDevResponse } from "./transform";
import { GENSHIN_DEV_URL } from "./url";

const cache = {
  getTalentDescriptions: (character: AppCharacter) => {
    const { activeTalents, passiveTalents } = character;

    if (activeTalents.NAs.description) {
      const descriptions = LEVELABLE_TALENT_TYPES.map((type) => {
        return activeTalents[type]?.description || NO_DESCRIPTION_MSG;
      });

      if (activeTalents.altSprint) {
        descriptions.push(activeTalents.altSprint.description || NO_DESCRIPTION_MSG);
      }

      descriptions.push(
        ...passiveTalents.map((talent) => talent.description || NO_DESCRIPTION_MSG)
      );

      return descriptions;
    }

    return undefined;
  },
  getConsDescriptions: (character: AppCharacter) => {
    const { constellation = [] } = character;

    if (!constellation.length) {
      // Aloy
      return [];
    }

    if (constellation[0].description) {
      return constellation.map((cons) => cons.description || NO_DESCRIPTION_MSG);
    }

    return undefined;
  },
  set: (
    { skillDescriptions, passiveDescriptions, constellationDescriptions }: GenshinDevData,
    character: AppCharacter
  ) => {
    const { NAs, ES, EB, altSprint } = character.activeTalents;

    NAs.description = skillDescriptions.NAs;
    ES.description = skillDescriptions.ES;
    EB.description = skillDescriptions.EB;

    if (altSprint) {
      altSprint.description = skillDescriptions.altSprint;
    }

    character.passiveTalents.forEach((talent, index) => {
      talent.description = passiveDescriptions[index];
    });
    character.constellation.forEach((cons, index) => {
      cons.description = constellationDescriptions[index];
    });
  },
};

export async function fetchTalentDescriptions(code: number): Promise<string[]> {
  const character = $AppCharacter.get(code);

  if (!character) {
    throw new Error("Character not found");
  }

  const cacheDescriptions = cache.getTalentDescriptions(character);

  if (cacheDescriptions) {
    return cacheDescriptions;
  }

  const processData = (res: any) => {
    const data = transformGenshinDevResponse(res);
    cache.set(data, character);
    return Object.values(data.skillDescriptions).concat(data.passiveDescriptions);
  };

  const response = await customFetch(GENSHIN_DEV_URL.character(character.name), {
    processData,
    processError: (res: GenshinDevErrorResponse) => res.error,
  });

  if (response.data) {
    return response.data;
  }

  throw new Error(response.message);
}

export async function fetchConsDescriptions(code: number): Promise<string[]> {
  const character = $AppCharacter.get(code);

  if (!character) {
    throw new Error("Character not found");
  }

  const cacheDescriptions = cache.getConsDescriptions(character);

  if (cacheDescriptions) {
    return cacheDescriptions;
  }

  const processData = (res: any) => {
    const data = transformGenshinDevResponse(res);
    cache.set(data, character);
    return data.constellationDescriptions;
  };

  const response = await customFetch(GENSHIN_DEV_URL.character(character.name), {
    processData,
    processError: (res: GenshinDevErrorResponse) => res.error,
  });

  if (response.data) {
    return response.data;
  }

  throw new Error(response.message);
}

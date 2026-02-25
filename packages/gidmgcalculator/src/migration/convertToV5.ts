import type { AppCharacter } from "@/types";
import type { ExactOmit } from "rond";
import type { DatabaseDataV4 } from "./types/v4";
import type { DatabaseDataV5 } from "./types/v5";

import { $AppCharacter } from "@/services";
import Array_ from "@/utils/Array";

const cache = new Map<string, AppCharacter>();

function getCharacter(name: string) {
  const cached = cache.get(name);

  if (cached) {
    return cached;
  }

  const character = $AppCharacter.characters.find((c) => c.name === name);

  if (character) {
    cache.set(name, character);
    return character;
  }
}

function convertCharacter<T extends { name: string }>(
  character: T
): (ExactOmit<T, "name"> & { code: number }) | undefined {
  const { name, ...rest } = character;
  const code = getCharacter(name)?.code;

  if (code) {
    return {
      ...rest,
      code,
    };
  }

  return undefined;
}

export function convertToV5(data: DatabaseDataV4): DatabaseDataV5 {
  const characters: DatabaseDataV5["characters"] = [];
  const weapons: DatabaseDataV5["weapons"] = [];
  const artifacts: DatabaseDataV5["artifacts"] = [];
  const setups: DatabaseDataV5["setups"] = [];

  for (const character of data.characters) {
    const newCharacter = convertCharacter(character);

    if (newCharacter) {
      characters.push(newCharacter);
    }
  }

  for (const weapon of data.weapons) {
    const { owner, ...rest } = weapon;

    if (owner) {
      const code = getCharacter(owner)?.code;

      if (code) {
        weapons.push({
          ...rest,
          owner: code,
        });
      }
    } else {
      weapons.push(rest);
    }
  }

  for (const artifact of data.artifacts) {
    const { owner, ...rest } = artifact;

    if (owner) {
      const code = getCharacter(owner)?.code;

      if (code) {
        artifacts.push({
          ...rest,
          owner: code,
        });
      }
    } else {
      artifacts.push(rest);
    }
  }

  for (const setup of data.setups) {
    if (setup.type === "complex") {
      const { allIDs, ...rest } = setup;
      const newAllIDs: typeof allIDs = {};

      for (const [name, setupId] of Object.entries(allIDs)) {
        const character = getCharacter(name);

        if (character) {
          newAllIDs[character.code] = setupId;
        }
      }

      setups.push({
        ...rest,
        allIDs: newAllIDs,
      });
      continue;
    }

    const { main, teammates, ...rest } = setup;
    const newMain = convertCharacter(main);
    const newTeammates = teammates.map((teammate) => convertCharacter(teammate));

    if (newMain) {
      setups.push({
        ...rest,
        main: newMain,
        teammates: Array_.truthify(newTeammates),
      });
    }
  }

  return {
    ...data,
    version: 5,
    characters,
    weapons,
    artifacts,
    setups,
  };
}

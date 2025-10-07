import { Level } from "@Calculation";
import { createSelector } from "@reduxjs/toolkit";

import { $AppCharacter } from "@/services";
import { selectUserCharacters } from "@Store/userdb-slice";

export type CharacterToBeSorted = {
  name: string;
  level: Level;
  rarity: number;
  index: number;
};

export const selectCharacterToBeSorted = createSelector(selectUserCharacters, (userChars) =>
  userChars.map<CharacterToBeSorted>((character, index) => {
    const { name, rarity } = $AppCharacter.get(character.name);
    return { name, level: character.level, rarity, index };
  })
);

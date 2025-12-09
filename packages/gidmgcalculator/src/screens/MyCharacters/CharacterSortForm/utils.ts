import { createSelector } from "@reduxjs/toolkit";

import type { AppCharacter, ICharacterBasic } from "@/types";

import { $AppCharacter } from "@/services";
import { selectDbCharacters } from "@Store/userdb-slice";

export type CharacterToBeSorted = ICharacterBasic & {
  index: number;
  data: AppCharacter;
};

export const selectCharacterToBeSorted = createSelector(selectDbCharacters, (userChars) =>
  userChars.map<CharacterToBeSorted>((character, index) => {
    return {
      ...character,
      data: $AppCharacter.get(character.name),
      index,
    };
  })
);

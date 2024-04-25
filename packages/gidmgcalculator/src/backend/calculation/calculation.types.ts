import type { Character, PartyData } from "@Src/types";
import type { AppCharacter } from "../types";

export type CharacterStatus = {
  BOL: number;
};

export type CalcUltilInfo = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  charStatus?: CharacterStatus;
};

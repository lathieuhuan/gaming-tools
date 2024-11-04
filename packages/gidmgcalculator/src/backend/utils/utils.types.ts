import { Character, PartyData } from "@Src/types";
import { AppCharacter } from "../types";

export type CalculationInfo = {
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
};

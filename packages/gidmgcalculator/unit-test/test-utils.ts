import { CalculationInfo } from "../src/backend";
import { $AppCharacter } from "../src/services";
import { PartyData } from "../src/types";
import { EMockCharacter } from "./mocks/characters.mock";

export function genCalculationInfo(
  characterName: EMockCharacter = EMockCharacter.BASIC,
  partyData: PartyData = []
): CalculationInfo {
  return {
    char: {
      name: characterName,
      level: "1/20",
      cons: 0,
      NAs: 1,
      ES: 1,
      EB: 1,
    },
    appChar: $AppCharacter.get(characterName),
    partyData,
  };
}

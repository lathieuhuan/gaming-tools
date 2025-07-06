import { CharacterReadData } from "@Calculation";
import { $AppCharacter } from "@Src/services";
import { AppCharactersByName, CalcCharacter, Party } from "@Src/types";
import Array_ from "./array-utils";

export function makeCharacterReadData(character: CalcCharacter, party: Party = []) {
  const appCharacters: AppCharactersByName = {
    [character.name]: $AppCharacter.get(character.name),
  };

  Array_.truthyOp(party).each((teammate) => {
    appCharacters[teammate.name] = $AppCharacter.get(teammate.name);
  });

  return new CharacterReadData(character, appCharacters, party);
}

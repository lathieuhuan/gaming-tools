import { TeamData } from "@Calculation";
import { $AppCharacter } from "@Src/services";
import { AppCharactersByName, Character, Teammates } from "@Src/types";
import Array_ from "./array-utils";

export function makeTeamData(character: Character, teammates: Teammates = []) {
  const appCharacters: AppCharactersByName = {
    [character.name]: $AppCharacter.get(character.name),
  };
  let teammateNames: string[] = [];

  Array_.truthyOp(teammates).each((teammate) => {
    appCharacters[teammate.name] = $AppCharacter.get(teammate.name);
    teammateNames.push(teammate.name);
  });

  return new TeamData(character.name, teammateNames, appCharacters);
}

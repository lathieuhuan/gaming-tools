import { CharacterRecord } from "@Backend";
import { $AppCharacter } from "@Src/services";
import { AppCharactersByName, CalcCharacter, Party } from "@Src/types";
import Array_ from "./array-utils";

export function makeUICharacterRecord(character: CalcCharacter, party: Party) {
  const appCharacters: AppCharactersByName = {};

  if (character?.name) {
    appCharacters[character.name] = $AppCharacter.get(character.name);
  }

  Array_.truthyOp(party).useEach("name", (name) => {
    appCharacters[name] = $AppCharacter.get(name);
  });

  return new CharacterRecord(character, appCharacters, party);
}

export function toCharacterRecord(record: UICharacterRecord): CharacterRecord {
  return record as CharacterRecord;
}

export type UICharacterRecord = Pick<
  CharacterRecord,
  "appCharacter" | "getAppCharacter" | "getTotalXtraTalentLv" | "getFinalTalentLv"
>;

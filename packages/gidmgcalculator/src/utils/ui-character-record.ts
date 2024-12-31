import { CharacterRecord } from "@Backend";
import { $AppCharacter } from "@Src/services";
import { AppCharactersByName, CalcCharacter, Party } from "@Src/types";

export function makeUICharacterRecord(character: CalcCharacter, party: Party) {
  const appCharacters: AppCharactersByName = {};

  function record(character?: { name: string } | null) {
    const name = character?.name;
    if (name && !appCharacters[name]) appCharacters[name] = $AppCharacter.get(name);
  }

  record(character);

  party.forEach(record);

  return new CharacterRecord(character, appCharacters, party);
}

export function toCharacterRecord(record: UICharacterRecord): CharacterRecord {
  return record as CharacterRecord;
}

export type UICharacterRecord = Pick<
  CharacterRecord,
  "appCharacter" | "getAppCharacter" | "getTotalXtraTalentLv" | "getFinalTalentLv"
>;

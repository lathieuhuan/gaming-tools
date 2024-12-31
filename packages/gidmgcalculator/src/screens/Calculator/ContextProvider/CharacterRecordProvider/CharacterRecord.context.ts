import { createContext } from "react";
import { CharacterRecord } from "@Backend";
import { AppCharactersByName, CalcCharacter, Party } from "@Src/types";
import Array_ from "@Src/utils/array-utils";
import { $AppCharacter } from "@Src/services";

export function makeCalcCharacterRecord(character: CalcCharacter, party: Party) {
  const appCharacters: AppCharactersByName = {};

  if (character?.name) {
    appCharacters[character.name] = $AppCharacter.get(character.name);
  }

  Array_.truthyOp(party).useEach("name", (name) => {
    appCharacters[name] = $AppCharacter.get(name);
  });

  const record = new CharacterRecord(character, appCharacters, party);

  return {
    mainAppCharacter: record.mainAppCharacter,
    getAppCharacter(...arg: Parameters<CharacterRecord["getAppCharacter"]>) {
      return record.getAppCharacter(...arg);
    },
    getTotalXtraTalentLv(...arg: Parameters<CharacterRecord["getTotalXtraTalentLv"]>) {
      return record.getTotalXtraTalentLv(...arg);
    },
    getFinalTalentLv(...arg: Parameters<CharacterRecord["getFinalTalentLv"]>) {
      return record.getFinalTalentLv(...arg);
    },
  };
}

export type CalcCharacterRecord = ReturnType<typeof makeCalcCharacterRecord>;

export const CharacterRecordContext = createContext<CalcCharacterRecord | undefined>(undefined);

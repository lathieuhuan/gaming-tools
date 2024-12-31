import { CharacterRecord } from "@Backend";
import { useMemo } from "react";

import { $AppCharacter } from "@Src/services";
import { AppCharactersByName } from "@Src/types";
import Array_ from "@Src/utils/array-utils";
import { selectCharacter, selectParty } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CharacterRecordContext } from "../contexts";

export function CharacterRecordProvider(props: { children: React.ReactElement }) {
  const character = useSelector(selectCharacter);
  const party = useSelector(selectParty) || [];
  const concatNames = party.reduce((acc, teammate) => `${acc}.${teammate?.name || ""}`, "");

  const characterRecord = useMemo<CharacterRecord | undefined>(() => {
    const appCharacters: AppCharactersByName = {};

    if (character?.name) {
      appCharacters[character.name] = $AppCharacter.get(character.name);
    }

    Array_.truthyOp(party).useEach("name", (name) => {
      appCharacters[name] = $AppCharacter.get(name);
    });

    return new CharacterRecord(character, appCharacters, party);
    //
  }, [character?.name, concatNames]);

  return <CharacterRecordContext.Provider value={characterRecord}>{props.children}</CharacterRecordContext.Provider>;
}

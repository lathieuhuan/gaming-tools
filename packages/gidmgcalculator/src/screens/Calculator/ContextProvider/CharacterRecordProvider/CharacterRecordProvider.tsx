import { useMemo } from "react";
import { makeUICharacterRecord } from "@Src/utils/ui-character-record";
import { selectCharacter, selectParty } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CharacterRecordContext } from "./CharacterRecord.context";

export function CharacterRecordProvider(props: { children: React.ReactElement }) {
  const character = useSelector(selectCharacter);
  const party = useSelector(selectParty) || [];
  const concatNames = party.reduce((acc, teammate) => `${acc}.${teammate?.name || ""}`, "");

  const characterRecord = useMemo(() => {
    return character ? makeUICharacterRecord(character, party) : undefined;
  }, [character, concatNames]);

  return <CharacterRecordContext.Provider value={characterRecord}>{props.children}</CharacterRecordContext.Provider>;
}

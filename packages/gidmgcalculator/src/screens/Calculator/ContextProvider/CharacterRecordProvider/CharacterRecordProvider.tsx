import { useMemo } from "react";
import { selectCharacter, selectParty } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CharacterRecordContext, makeCalcCharacterRecord } from "./CharacterRecord.context";

export function CharacterRecordProvider(props: { children: React.ReactElement }) {
  const character = useSelector(selectCharacter);
  const party = useSelector(selectParty) || [];
  const concatNames = party.reduce((acc, teammate) => `${acc}.${teammate?.name || ""}`, "");

  const characterRecord = useMemo(() => makeCalcCharacterRecord(character, party), [character?.name, concatNames]);

  return <CharacterRecordContext.Provider value={characterRecord}>{props.children}</CharacterRecordContext.Provider>;
}

import { useMemo } from "react";
import { makeCharacterReadData } from "@Src/utils/makeCharacterReadData";
import { selectCharacter, selectParty } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CharacterDataContext } from "./CharacterData.context";

export function CharacterDataProvider(props: { children: React.ReactElement }) {
  const character = useSelector(selectCharacter);
  const party = useSelector(selectParty) || [];
  const concatNames = party.reduce((acc, teammate) => `${acc}.${teammate?.name || ""}`, "");

  const data = useMemo(() => {
    return character ? makeCharacterReadData(character, party) : undefined;
  }, [character, concatNames]);

  return <CharacterDataContext.Provider value={data}>{props.children}</CharacterDataContext.Provider>;
}

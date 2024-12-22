import { useMemo } from "react";
import type { AppCharacter } from "@Backend";

import { $AppCharacter } from "@Src/services";
import { selectCharacter } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CharacterDataContext } from "../contexts";

export function CharacterDataProvider(props: { children: React.ReactElement }) {
  const character = useSelector(selectCharacter);

  const characterData = useMemo<AppCharacter | undefined>(() => {
    return character?.name ? $AppCharacter.get(character.name) : undefined;
  }, [character?.name]);

  return <CharacterDataContext.Provider value={characterData}>{props.children}</CharacterDataContext.Provider>;
}

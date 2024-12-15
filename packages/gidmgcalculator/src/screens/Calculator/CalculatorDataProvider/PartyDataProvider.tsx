import { useMemo } from "react";

import { $AppCharacter } from "@Src/services";
import { PartyData } from "@Src/types";
import { selectParty } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { PartyDataContext } from "../contexts";

export function PartyDataProvider(props: { children: React.ReactElement }) {
  const party = useSelector(selectParty) || [];
  const concatNames = party.reduce((acc, teammate) => `${acc}.${teammate?.name || ""}`, "");

  const characterData = useMemo<PartyData>(() => {
    return $AppCharacter.getPartyData(party);
  }, [concatNames]);

  return <PartyDataContext.Provider value={characterData}>{props.children}</PartyDataContext.Provider>;
}

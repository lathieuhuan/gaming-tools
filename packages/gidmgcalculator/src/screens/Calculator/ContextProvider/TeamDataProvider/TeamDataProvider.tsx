import { useMemo } from "react";

import type { Teammates } from "@/types";

import { CalcTeamData } from "@Calculation";
import Array_ from "@/utils/array-utils";
import { makeTeamData } from "@/utils/makeTeamData";
import { selectCharacter, selectTeammates } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CalcTeamDataContext, TeamDataContext } from "./context";

const emptyTeammates: Teammates = [];

export function TeamDataProvider(props: { children: React.ReactElement }) {
  const character = useSelector(selectCharacter);
  const teammates = useSelector(selectTeammates) || emptyTeammates;
  const teammateNames = Array_.truthy(teammates)
    .map((teammate) => teammate.name)
    .join("/");

  const teamData = useMemo(() => {
    return character ? makeTeamData(character, teammates) : undefined;
  }, [character?.name, teammateNames]);

  const calcTeamData = useMemo(() => {
    return character && teamData ? new CalcTeamData(character, teammates, teamData.data) : undefined;
  }, [character, teammates, teamData]);

  return (
    <TeamDataContext.Provider value={teamData}>
      <CalcTeamDataContext.Provider value={calcTeamData}>{props.children}</CalcTeamDataContext.Provider>
    </TeamDataContext.Provider>
  );
}

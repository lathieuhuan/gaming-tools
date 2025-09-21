import { CalcTeamData, TeamData } from "@Calculation";
import { useMemo } from "react";

import type { Character, Teammates } from "@/types";

import Array_ from "@/utils/Array";
import Entity_ from "@/utils/Entity";
import { selectCharacter, selectTeammates } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CalcTeamDataContext, TeamDataContext } from "./context";

const emptyTeammates: Teammates = [];

function makeTeamData(character: Character, teammates: Teammates = []) {
  const teammateNames = Array_.truthify(teammates).map((teammate) => teammate.name);
  const appCharacters = Entity_.getAppCharacters(character.name, teammates);

  return new TeamData(character.name, teammateNames, appCharacters);
}

export function TeamDataProvider(props: { children: React.ReactElement }) {
  const character = useSelector(selectCharacter);
  const teammates = useSelector(selectTeammates) || emptyTeammates;
  const teammateNames = Array_.truthify(teammates)
    .map((teammate) => teammate.name)
    .join("/");

  const teamData = useMemo(() => {
    return character ? makeTeamData(character, teammates) : undefined;
  }, [character?.name, teammateNames]);

  const calcTeamData = useMemo(() => {
    return character && teamData
      ? new CalcTeamData(character, teammates, teamData.data)
      : undefined;
  }, [character, teammates, teamData]);

  return (
    <TeamDataContext.Provider value={teamData}>
      <CalcTeamDataContext.Provider value={calcTeamData}>
        {props.children}
      </CalcTeamDataContext.Provider>
    </TeamDataContext.Provider>
  );
}

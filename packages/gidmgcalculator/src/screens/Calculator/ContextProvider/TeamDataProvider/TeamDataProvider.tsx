import { CalcTeamData, TeamData } from "@Calculation";
import { useMemo } from "react";

import type { AppCharactersByName, Character, Teammates } from "@/types";

import { $AppCharacter } from "@/services";
import Array_ from "@/utils/Array";
import { selectCharacter, selectTeammates } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { CalcTeamDataContext, TeamDataContext } from "./context";

const emptyTeammates: Teammates = [];

function makeTeamData(character: Character, teammates: Teammates = []) {
  const appCharacters: AppCharactersByName = {
    [character.name]: $AppCharacter.get(character.name),
  };
  let teammateNames: string[] = [];

  for (const teammate of Array_.truthify(teammates)) {
    appCharacters[teammate.name] = $AppCharacter.get(teammate.name);
    teammateNames.push(teammate.name);
  }

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

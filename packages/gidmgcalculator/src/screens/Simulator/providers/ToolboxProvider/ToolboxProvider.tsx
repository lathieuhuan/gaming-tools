import { useMemo } from "react";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

import { getActiveMember } from "@Simulator/Simulator.utils";
import { useStore } from "@Src/features";
import { $AppCharacter } from "@Src/services";
import { pickProps } from "@Src/utils";
import { getMember } from "@Store/simulator-slice";
import { ActiveMemberContext, ActiveMemberInfo, ActiveSimulationContext, ActiveSimulationInfo } from "./contexts";
import { AppParty, ToolsProvider } from "./ToolsProvider";
import { PartyData, SimulationMember } from "@Src/types";

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => getMember(state.simulator);

type SimulationData = {
  activeSimulationInfo: ActiveSimulationInfo;
  members: SimulationMember[];
};

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveId);
  const activeMember = useSelector(selectActiveMember);

  console.log("render: ToolboxProvider");

  const simulationData = useMemo<SimulationData | null>(() => {
    const simulation = store.select((state) => {
      const { activeId, simulationsById } = state.simulator;
      return simulationsById[activeId] ?? null;
    });
    if (!simulation) {
      return null;
    }

    const partyData: PartyData = [];
    const appParty: AppParty = {};

    for (const member of simulation.members) {
      const appCharacter = $AppCharacter.get(member.name);
      partyData.push(appCharacter);
      appParty[member.name] = appCharacter;
    }

    return {
      activeSimulationInfo: {
        partyData,
        target: simulation.target,
      },
      members: simulation.members,
    };
  }, [activeId]);

  const activeMemberInfo = useMemo<ActiveMemberInfo | null>(() => {
    const member = store.select(getActiveMember);

    if (member) {
      const char = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB", "weapon", "artifacts"]);
      const appChar = $AppCharacter.get(char.name);

      return {
        char,
        appChar,
      };
    }
    return null;
  }, [activeId, activeMember]);

  return (
    <ActiveSimulationContext.Provider value={simulationData?.activeSimulationInfo}>
      <ActiveMemberContext.Provider value={activeMemberInfo}>
        <ToolsProvider party={simulationData?.members} target={simulationData?.activeSimulationInfo.target}>
          {props.children}
        </ToolsProvider>
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

import { useMemo } from "react";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

import { getActiveMember } from "@Simulator/Simulator.utils";
import { useStore } from "@Src/features";
import { $AppCharacter, $AppWeapon } from "@Src/services";
import { pickProps } from "@Src/utils";
import { getMember } from "@Store/simulator-slice";
import { ActiveMemberContext, ActiveMemberInfo, ActiveSimulationContext, ActiveSimulationInfo } from "./contexts";
import { SimulatorTotalAttributeControl } from "./tools";
import { AppParty, ToolsProvider } from "./ToolsProvider";
import { PartyData } from "@Src/types";

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => getMember(state.simulator);

type SimulationData = {
  activeSimulationInfo: ActiveSimulationInfo;
  appParty: AppParty;
};

type MemberData = {
  activeMemberInfo: ActiveMemberInfo;
  totalAttrCtrl: SimulatorTotalAttributeControl;
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
      appParty,
    };
  }, [activeId]);

  const memberData = useMemo<MemberData | null>(() => {
    const member = store.select(getActiveMember);

    if (member) {
      const char = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB", "weapon", "artifacts"]);
      const appChar = $AppCharacter.get(char.name);
      const appWeapon = $AppWeapon.get(char.weapon.code)!;
      const totalAttrCtrl = new SimulatorTotalAttributeControl();

      totalAttrCtrl.construct(char, appChar, char.weapon, appWeapon, char.artifacts);

      return {
        activeMemberInfo: {
          char,
          appChar,
        },
        totalAttrCtrl,
      };
    }
    return null;
  }, [activeId, activeMember]);

  return (
    <ActiveSimulationContext.Provider value={simulationData?.activeSimulationInfo}>
      <ActiveMemberContext.Provider value={memberData?.activeMemberInfo}>
        <ToolsProvider
          data={
            simulationData && memberData
              ? {
                  activeSimulation: simulationData.activeSimulationInfo,
                  activeMember: memberData.activeMemberInfo,
                  appParty: simulationData.appParty,
                }
              : null
          }
          totalAttrCtrl={memberData?.totalAttrCtrl}
        >
          {props.children}
        </ToolsProvider>
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

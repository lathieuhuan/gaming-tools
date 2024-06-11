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
import { ToolsProvider } from "./ToolsProvider";

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => getMember(state.simulator);

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveId);
  const activeMember = useSelector(selectActiveMember);

  console.log("render: ToolboxProvider");

  const activeSimulationInfo = useMemo<ActiveSimulationInfo | null>(() => {
    const simulation = store.select((state) => {
      const { activeId, simulationsById } = state.simulator;
      return simulationsById[activeId] ?? null;
    });

    if (simulation) {
      return {
        partyData: $AppCharacter.getPartyData(simulation.members),
        target: simulation.target,
      };
    }
    return null;
  }, [activeId]);

  const [activeMemberInfo, totalAttrCtrl] = useMemo<
    [ActiveMemberInfo | null, SimulatorTotalAttributeControl | null]
  >(() => {
    const member = store.select(getActiveMember);

    if (member) {
      const char = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB", "weapon", "artifacts"]);
      const appChar = $AppCharacter.get(char.name);
      const appWeapon = $AppWeapon.get(char.weapon.code)!;
      const totalAttrCtrl = new SimulatorTotalAttributeControl();

      totalAttrCtrl.construct(char, appChar, char.weapon, appWeapon, char.artifacts);

      return [
        {
          char,
          appChar,
        },
        totalAttrCtrl,
      ];
    }
    return [null, null];
  }, [activeId, activeMember]);

  return (
    <ActiveSimulationContext.Provider value={activeSimulationInfo}>
      <ActiveMemberContext.Provider value={activeMemberInfo}>
        <ToolsProvider
          activeSimulation={activeSimulationInfo}
          activeMember={activeMemberInfo}
          totalAttrCtrl={totalAttrCtrl}
        >
          {props.children}
        </ToolsProvider>
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

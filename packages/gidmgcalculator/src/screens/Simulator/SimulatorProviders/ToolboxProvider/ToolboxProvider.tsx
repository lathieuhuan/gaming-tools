import { useMemo } from "react";
import type { SimulationMember } from "@Src/types";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";
import { selectActiveSimulation } from "@Store/simulator-slice";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import { useStore } from "@Src/features";
import { TotalAttributeControl } from "@Simulator/controls";
import { ActiveSimulationContext, ActiveMemberContext, TotalAttributeContext, ActiveMemberInfo } from "./contexts";

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => state.simulator.activeMember;

const getActiveMember = (state: RootState): SimulationMember | undefined => {
  const { activeId, activeMember, simulationsById } = state.simulator;
  return simulationsById[activeId]?.members?.find((member) => member.name === activeMember);
};

type ToolBox =
  | {
      totalAttrCtrl: TotalAttributeControl;
    }
  | undefined;

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveId);
  const activeMember = useSelector(selectActiveMember);

  console.log("render: ToolboxProvider");

  const activeSimulationInfo = useMemo(() => {
    const simulation = store.select(selectActiveSimulation);

    if (simulation) {
      return {
        partyData: $AppCharacter.getPartyData(simulation.members),
      };
    }
    return null;
  }, [activeId]);

  const [activeMemberInfo, toolbox] = useMemo<[ActiveMemberInfo | null, ToolBox]>(() => {
    const member = store.select(getActiveMember);

    if (member) {
      const char = member.info;
      const appChar = $AppCharacter.get(char.name);
      const appWeapon = $AppWeapon.get(char.weapon.code)!;

      return [
        {
          char: member.info,
          appChar,
        },
        {
          totalAttrCtrl: new TotalAttributeControl().construct(char, appChar, char.weapon, appWeapon, char.artifacts),
        },
      ];
    }
    return [null, undefined];
  }, [activeId, activeMember]);

  return (
    <ActiveSimulationContext.Provider value={activeSimulationInfo}>
      <ActiveMemberContext.Provider value={activeMemberInfo}>
        <TotalAttributeProvider totalAttrCtrl={toolbox?.totalAttrCtrl}>{props.children}</TotalAttributeProvider>
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

const selectAttributeBonus = (state: RootState) => getActiveMember(state)?.bonus.attributeBonus;

interface TotalAttributeProviderProps {
  totalAttrCtrl?: TotalAttributeControl;
  children: React.ReactNode;
}
function TotalAttributeProvider({ totalAttrCtrl, children }: TotalAttributeProviderProps) {
  const attributeBonus = useSelector(selectAttributeBonus);

  console.log("render: TotalAttributeProvider");

  const totalAttr = useMemo(() => {
    return totalAttrCtrl?.applyAttributeBonus(attributeBonus) ?? null;
  }, [totalAttrCtrl, attributeBonus]);

  return <TotalAttributeContext.Provider value={totalAttr}>{children}</TotalAttributeContext.Provider>;
}

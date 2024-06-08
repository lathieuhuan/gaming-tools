import { useMemo } from "react";
import type { SimulationMember } from "@Src/types";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import { useStore } from "@Src/features";
import { pickProps } from "@Src/utils";
import { SimulatorTotalAttributeControl } from "@Simulator/calculation";
import { ActiveSimulationContext, ActiveMemberContext, TotalAttributeContext, ActiveMemberInfo } from "./contexts";

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => state.simulator.activeMember;

const getActiveMember = (state: RootState): SimulationMember | undefined => {
  const { activeId, activeMember, simulationsById } = state.simulator;
  return simulationsById[activeId]?.members?.find((member) => member.name === activeMember);
};

type ToolBox = {
  totalAttrCtrl: SimulatorTotalAttributeControl;
} | null;

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveId);
  const activeMember = useSelector(selectActiveMember);

  console.log("render: ToolboxProvider");

  const activeSimulationInfo = useMemo(() => {
    const simulation = store.select((state) => {
      const { activeId, simulationsById } = state.simulator;
      return simulationsById[activeId] ?? null;
    });

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
        {
          totalAttrCtrl,
        },
      ];
    }
    return [null, null];
  }, [activeId, activeMember]);

  return (
    <ActiveSimulationContext.Provider value={activeSimulationInfo}>
      <ActiveMemberContext.Provider value={activeMemberInfo}>
        <TotalAttributeProvider totalAttrCtrl={toolbox?.totalAttrCtrl}>{props.children}</TotalAttributeProvider>
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

const selectAttributeBonus = (state: RootState) => getActiveMember(state)?.attributeBonus;

interface TotalAttributeProviderProps {
  totalAttrCtrl?: SimulatorTotalAttributeControl;
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

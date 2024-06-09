import { useMemo } from "react";
import { SimulatorBuffApplier } from "@Backend";
import type { SimulationMember } from "@Src/types";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import { useStore } from "@Src/features";
import { pickProps } from "@Src/utils";
import { SimulatorTotalAttributeControl } from "@Simulator/calculation";
import {
  ActiveSimulationContext,
  ActiveMemberContext,
  ToolboxContext,
  ActiveMemberInfo,
  ActiveSimulationInfo,
} from "./contexts";

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => state.simulator.activeMember;

const getActiveMember = (state: RootState): SimulationMember | undefined => {
  const { activeId, activeMember, simulationsById } = state.simulator;
  return simulationsById[activeId]?.members?.find((member) => member.name === activeMember);
};

type ToolBox = {
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

  const [activeMemberInfo, toolbox] = useMemo<[ActiveMemberInfo | null, ToolBox | null]>(() => {
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
        <Toolbox
          activeSimulationInfo={activeSimulationInfo}
          activeMemberInfo={activeMemberInfo}
          totalAttrCtrl={toolbox?.totalAttrCtrl}
        >
          {props.children}
        </Toolbox>
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

const selectAttributeBonus = (state: RootState) => getActiveMember(state)?.attributeBonus;

interface ToolboxProps {
  activeMemberInfo: ActiveMemberInfo | null;
  activeSimulationInfo: ActiveSimulationInfo | null;
  totalAttrCtrl?: SimulatorTotalAttributeControl;
  children: React.ReactNode;
}
function Toolbox({ activeMemberInfo, activeSimulationInfo, totalAttrCtrl, children }: ToolboxProps) {
  const attributeBonus = useSelector(selectAttributeBonus);

  console.log("render: Toolbox");

  const totalAttr = useMemo(() => {
    if (!activeSimulationInfo || !activeMemberInfo || !totalAttrCtrl) {
      return null;
    }
    const totalAttr = totalAttrCtrl.applyAttributeBonus(attributeBonus);

    const buffApplier = new SimulatorBuffApplier({ ...activeMemberInfo, ...activeSimulationInfo }, totalAttr);

    return {
      totalAttr,
      buffApplier,
    };
  }, [totalAttrCtrl, attributeBonus]);

  return <ToolboxContext.Provider value={totalAttr}>{children}</ToolboxContext.Provider>;
}

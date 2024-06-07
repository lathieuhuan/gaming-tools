import { useMemo } from "react";
import type { SimulationMember } from "@Src/types";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";
import { $AppCharacter, $AppWeapon } from "@Src/services";
import { useStore } from "@Src/features";
import { TotalAttributeControl } from "../../controls";
import { ActiveMemberContext, TotalAttributeContext } from "./contexts";

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => state.simulator.activeMember;

const getActiveMember = (state: RootState): SimulationMember | undefined => {
  const { activeId, activeMember, simulationsById } = state.simulator;
  return simulationsById[activeId]?.members?.find((member) => member.name === activeMember);
};

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveId);
  const activeMember = useSelector(selectActiveMember);

  console.log("render: ToolboxProvider");

  const [activeMemberInfo = null, toolbox] = useMemo(() => {
    const member = store.select(getActiveMember);

    if (member) {
      const appChar = $AppCharacter.get(member.name);
      const appWeapon = $AppWeapon.get(member.weapon.code)!;

      return [
        {
          char: member,
          appChar,
        },
        {
          totalAttrCtrl: new TotalAttributeControl().construct(
            member,
            appChar,
            member.weapon,
            appWeapon,
            member.artifacts
          ),
        },
      ];
    }
    return [];
  }, [activeId, activeMember]);

  return (
    <ActiveMemberContext.Provider value={activeMemberInfo}>
      <TotalAttributeProvider totalAttrCtrl={toolbox?.totalAttrCtrl}>{props.children}</TotalAttributeProvider>
    </ActiveMemberContext.Provider>
  );
}

const selectAttributeBonus = (state: RootState) => getActiveMember(state)?.attributeBonus;

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

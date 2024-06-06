import { useMemo, useRef } from "react";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";
import { $AppCharacter, $AppWeapon } from "@Src/services";
import { selectActiveSimulation } from "@Store/simulator-slice";

import { TotalAttributeControl } from "../../controls";
import { ToolboxContext } from "./toolbox-context";
import { useStore } from "@Src/features";
import { Simulation } from "@Src/types";

type HandmadeStore = ReturnType<typeof useStore>;

const selectActiveId = (state: RootState) => state.simulator.activeId;

const selectActiveMember = (state: RootState) => state.simulator.activeMember;

const getActiveSimulation = (store: HandmadeStore): Simulation | null => {
  return store.select((state) => {
    const { activeId, simulationsById } = state.simulator;
    return simulationsById[activeId] ?? null;
  });
};

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();

  const activeId = useSelector(selectActiveId);
  const activeMember = useSelector(selectActiveMember);

  const toolbox = useMemo(() => {
    const member = getActiveSimulation(store)?.members.find((member) => member.name === activeMember);

    if (member) {
      const appChar = $AppCharacter.get(member.name);
      const appWeapon = $AppWeapon.get(member.weapon.code)!;

      return {
        char: member,
        appChar,
        totalAttrCtrl: new TotalAttributeControl(member, appChar, member.weapon, appWeapon, member.artifacts),
      };
    }
    return null;
  }, [activeId, activeMember]);

  return (
    <ToolboxContext.Provider value={null}>
      <TotalAttributeProvider totalAttrCtrl={toolbox?.totalAttrCtrl}>{props.children}</TotalAttributeProvider>
    </ToolboxContext.Provider>
  );
}

const selectModifyEvents = (state: RootState) => {
  const { activeId, simulationsById } = state.simulator;
  return simulationsById[activeId]?.modifyEvents;
};

interface Props {
  totalAttrCtrl?: TotalAttributeControl;
  children: React.ReactNode;
}
function TotalAttributeProvider({ totalAttrCtrl, children }: Props) {
  const modifyEvents = useSelector(selectModifyEvents);

  const a = useMemo(() => {
    
  }, [modifyEvents]);

  return <>{children}</>;
}

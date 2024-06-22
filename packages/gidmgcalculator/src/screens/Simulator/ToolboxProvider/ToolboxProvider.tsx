import { useEffect, useMemo } from "react";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

import { useStore } from "@Src/features";
import { getSimulation, selectActiveMember } from "@Store/simulator-slice";
import { ActiveMemberContext, ActiveSimulationContext } from "./toolbox-contexts";
import { SimulationControl, ActiveMemberTools } from "./tools";

const selectActiveId = (state: RootState) => state.simulator.activeId;

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveId);
  const activeMemberName = useSelector(selectActiveMember);

  const activeSimulation = useMemo(() => {
    const simulation = store.select((state) => getSimulation(state.simulator));
    if (!simulation) {
      return null;
    }

    const control = new SimulationControl(simulation.members, simulation.target);

    return {
      members: simulation.members,
      control,
    };
  }, [activeId]);

  const activeMember = useMemo(() => {
    if (!activeSimulation || !activeMemberName) {
      return null;
    }
    const memberCode = activeSimulation.control.partyData.find((member) => member?.name === activeMemberName)?.code;
    const memberInfo = activeSimulation.members.find((member) => member.name === activeMemberName);
    if (!memberCode || !memberInfo) {
      return null;
    }

    const control = activeSimulation.control.member[memberCode];

    const tools = new ActiveMemberTools(control, (args) => activeSimulation.control.config(memberCode, args));

    return {
      info: memberInfo,
      data: control.data,
      tools,
    };
  }, [activeSimulation, activeMemberName]);

  return (
    <ActiveSimulationContext.Provider value={activeSimulation?.control ?? null}>
      <ActiveMemberContext.Provider value={activeMember}>
        <EventsProcessor control={activeSimulation?.control} />
        {props.children}
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

const selectChunks = (state: RootState) => getSimulation(state.simulator)?.chunks ?? [];

function EventsProcessor({ control }: { control?: SimulationControl }) {
  const chunks = useSelector(selectChunks);

  useEffect(() => {
    control?.processChunks(chunks);
  }, [control, chunks]);

  return null;
}

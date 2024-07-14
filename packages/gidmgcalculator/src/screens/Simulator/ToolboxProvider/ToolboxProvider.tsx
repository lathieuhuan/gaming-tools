import { useEffect, useMemo } from "react";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

import { useStore } from "@Src/features";
import { getSimulation, selectActiveMember } from "@Store/simulator-slice";
import { ActiveMemberContext, ActiveSimulationContext } from "./toolbox-contexts";
import { SimulationControl, ActiveMember } from "./simulation-control";

const selectActiveId = (state: RootState) => state.simulator.activeId;

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveId);
  const activeMemberCode = useSelector(selectActiveMember);

  const activeSimulation = useMemo(() => {
    const simulation = store.select((state) => getSimulation(state.simulator));
    if (!simulation) {
      return null;
    }

    const control = new SimulationControl(simulation.members, simulation.target);

    return {
      members: simulation.members,
      control,
      manager: control.genManager(),
    };
  }, [activeId]);

  const activeMember = useMemo<ActiveMember | null>(() => {
    if (!activeSimulation || !activeMemberCode) {
      return null;
    }

    return activeSimulation.control.genActiveMember(activeMemberCode);
    //
  }, [activeSimulation, activeMemberCode]);

  return (
    <ActiveSimulationContext.Provider value={activeSimulation?.manager ?? null}>
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

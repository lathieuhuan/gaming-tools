import { useEffect, useMemo } from "react";

import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

import { useStore } from "@Src/features";
import { getSimulation, selectActiveMember, selectActiveSimulationId } from "@Store/simulator-slice";
import { SimulationControl, ActiveMember } from "./simulation-control";
import { ActiveMemberContext, ActiveSimulationContext } from "./toolbox-contexts";

interface ToolboxProviderProps {
  children: React.ReactNode;
}
export function ToolboxProvider(props: ToolboxProviderProps) {
  const store = useStore();
  const activeId = useSelector(selectActiveSimulationId);
  const activeMemberCode = useSelector(selectActiveMember);

  const activeSimulation = useMemo(() => {
    const simulation = store.select((state) => getSimulation(state.simulator));
    if (!simulation) {
      return null;
    }

    const control = new SimulationControl(simulation);

    return {
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
        {activeSimulation?.control ? <EventsProcessor control={activeSimulation.control} /> : null}
        {props.children}
      </ActiveMemberContext.Provider>
    </ActiveSimulationContext.Provider>
  );
}

const selectChunks = (state: RootState) => getSimulation(state.simulator)?.chunks ?? [];

function EventsProcessor({ control }: { control: SimulationControl }) {
  const chunks = useSelector(selectChunks);

  useEffect(() => {
    if (!chunks.length) {
      console.error("No chunks found");
      return;
    }
    if (chunks.length > 1) {
      const firstEmptyChunkIndex = chunks.findIndex((chunk) => !chunk.events.length);

      if (firstEmptyChunkIndex > -1 && firstEmptyChunkIndex < chunks.length - 1) {
        console.error(`Found empty chunk at ${firstEmptyChunkIndex}`);
        return;
      }
    }

    control.processChunks(chunks);
    //
  }, [control, chunks]);

  return null;
}

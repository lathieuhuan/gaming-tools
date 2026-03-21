import { useSimulatorStore } from "../store";
import { TeamAssembler } from "./TeamAssembler";
import { TopBar, TopBarEmpty } from "./TopBar";

type SimulationPrepperProps = {
  onStart: () => void;
};

export function SimulationPrepper({ onStart }: SimulationPrepperProps) {
  const isEmpty = useSimulatorStore(
    (state) => !state.activeId || !state.simulationsById[state.activeId]
  );

  if (isEmpty) {
    return (
      <div className="h-full flex flex-col">
        <TopBarEmpty />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar onStart={onStart} />
      <TeamAssembler className="grow" />
    </div>
  );
}

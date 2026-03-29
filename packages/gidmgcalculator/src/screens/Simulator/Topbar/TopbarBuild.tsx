import { Button, clsx, FancyBackSvg } from "rond";

import { selectSimulation, useSimulatorStore } from "../store";
import { restart } from "../actions/build";

type TopbarBuildProps = {
  className?: string;
};

export function TopbarBuild({ className }: TopbarBuildProps) {
  const manager = useSimulatorStore((state) =>
    state.managers.find((manager) => manager.id === state.activeId)
  );

  if (!manager) {
    return null;
  }

  const handleBack = () => {
    useSimulatorStore.setState({ phase: "PREP" });
  };

  // TODO: ask for confirmation
  const handleRestart = () => {
    restart();
  };

  return (
    <div
      className={clsx("h-16 flex items-center bg-dark-2 shrink-0", className)}
      onDoubleClick={() => {
        console.info(selectSimulation(useSimulatorStore.getState()));
      }}
    >
      <div className="flex items-center gap-2">
        <Button boneOnly icon={<FancyBackSvg className="text-light-hint" />} onClick={handleBack} />

        <span>{manager.name}</span>
      </div>

      <Button className="ml-auto" size="small" onClick={handleRestart}>
        Restart
      </Button>
    </div>
  );
}

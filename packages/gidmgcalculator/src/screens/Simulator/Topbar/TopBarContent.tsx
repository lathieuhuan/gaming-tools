import { FaPlus } from "react-icons/fa";
import { Button } from "rond";

import { startNewSimulation } from "../actions/prepare";
import { selectSimulation, useSimulatorStore } from "../store";

// Components
import { TopbarBuild } from "./TopbarBuild";
import { TopbarPrep } from "./TopbarPrep";

type TopBarContentProps = {
  className?: string;
};

export function TopBarContent({ className }: TopBarContentProps) {
  const phase = useSimulatorStore((state) => state.phase);
  const simulation = useSimulatorStore(selectSimulation);

  if (phase === "PREP") {
    if (!simulation) {
      return (
        <div className={className}>
          <Button boneOnly icon={<FaPlus />} onClick={() => startNewSimulation()}>
            New
          </Button>
        </div>
      );
    }

    return <TopbarPrep className={className} simulation={simulation} />;
  }

  return <TopbarBuild className={className} />;
}

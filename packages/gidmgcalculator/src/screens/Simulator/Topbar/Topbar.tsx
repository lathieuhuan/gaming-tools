import { FaPlus } from "react-icons/fa";
import { TbLayoutSidebar } from "react-icons/tb";
import { Button } from "rond";

import { startNewSimulation } from "../actions/prepare";
import { SimulatorPhase, useSimulatorStore } from "../store";

// Components
import { TopbarBuild } from "./TopbarBuild";
import { TopbarPrep } from "./TopbarPrep";

type TopbarProps = {
  phase: SimulatorPhase;
  noActiveSimulation: boolean;
};

export function TopBar({ phase, noActiveSimulation }: TopbarProps) {
  const renderContent = () => {
    if (phase === "PREP") {
      if (noActiveSimulation) {
        return (
          <div className="grow">
            <Button boneOnly icon={<FaPlus />} onClick={() => startNewSimulation()}>
              New
            </Button>
          </div>
        );
      }

      return <TopbarPrep className="grow" />;
    }

    return <TopbarBuild className="grow" />;
  };

  return (
    <div className="flex justify-center bg-dark-2">
      <div className="w-full h-16 px-4 flex items-center">
        <Button
          boneOnly
          icon={<TbLayoutSidebar className="text-2xl" />}
          onClick={() => useSimulatorStore.setState({ sidebarOpen: true })}
        />
        <div className="mx-2 w-px h-6 bg-dark-line" />
        {renderContent()}
      </div>
    </div>
  );
}

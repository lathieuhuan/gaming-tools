import { useState } from "react";
import { ButtonGroup, clsx, cn, TrashCanSvg } from "rond";

import { deleteSimulation } from "../actions/prepare";
import { SimulationManager, useSimulatorStore } from "../store";

export type SimulationListProps = {
  className?: string;
};

export function SimulationList({ className }: SimulationListProps) {
  const simulations = useSimulatorStore((state) => state.managers);
  const activeId = useSimulatorStore((state) => state.activeId);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelectSimulation = (manager: SimulationManager) => {
    useSimulatorStore.setState({
      activeId: manager.id,
      sidebarOpen: false,
    });
  };

  const handleDeleteSimulation = (manager: SimulationManager) => {
    // TODO ask for confirmation
    deleteSimulation(manager.id);
  };

  if (simulations.length === 0) {
    return (
      <div className={className}>
        <p className="mt-6 text-light-hint text-center">No simulations found</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {simulations.map((simulation) => {
        const selected = selectedId === simulation.id;

        return (
          <div
            key={simulation.id}
            className={cn(
              "p-2 rounded bg-dark-1 group",
              selected && "shadow-hightlight-1 shadow-active"
            )}
            onClick={() => setSelectedId(simulation.id)}
          >
            <div>{simulation.name}</div>

            <div className="mt-2 h-6 flex items-end justify-between">
              {activeId === simulation.id && <p className="text-light-hint text-sm">Current</p>}

              <ButtonGroup
                className={clsx(
                  "ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  selected && "opacity-100"
                )}
                buttons={[
                  {
                    size: "small",
                    icon: <TrashCanSvg className="text-xs" />,
                    onClick: () => handleDeleteSimulation(simulation),
                  },
                  // TODO: re-style
                  {
                    size: "small",
                    children: "Select",
                    onClick: () => handleSelectSimulation(simulation),
                  },
                ]}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { ButtonGroup, Drawer } from "rond";
import { FaPlus } from "react-icons/fa";

import { SimulationManager, useSimulatorStore } from "../store";
import { SimulationList } from "./SimulationList";
import { startNewSimulation } from "../actions/prepare";

import { CONFIG_1 } from "../mock/simulation1";
import { createSimulation1 } from "../mock/utils";
import { Simulation } from "../types";
import { IS_DEV_ENV } from "@/constants";

export function Sidebar() {
  const sidebarOpen = useSimulatorStore((state) => state.sidebarOpen);

  const closeSidebar = () => useSimulatorStore.setState({ sidebarOpen: false });

  const handleAddNewSimulation = () => {
    startNewSimulation();
    closeSidebar();
  };

  const handleStartDevSession = () => {
    const configs = [CONFIG_1];
    const managers: SimulationManager[] = [];
    const simulationsById: Record<string, Simulation> = {};

    for (const config of configs) {
      const simulation = createSimulation1(config.members);

      managers.push({
        id: simulation.id,
        name: config.name,
      });
      simulationsById[simulation.id] = simulation;
    }

    useSimulatorStore.setState({
      managers,
      simulationsById,
    });
  };

  return (
    <Drawer
      active={sidebarOpen}
      destroyOnClose
      className="bg-dark-2 shadow-popup"
      position="left"
      width={256}
      onClose={closeSidebar}
    >
      <div className="h-full flex flex-col">
        <div className="px-4">
          <div className="pt-4 pb-2 text-lg font-bold border-b border-dark-line">Simulations</div>
        </div>

        <SimulationList className="p-4 grow custom-scrollbar" />

        <ButtonGroup
          className="p-4"
          buttons={[
            {
              hidden: !IS_DEV_ENV,
              children: "Dev",
              onClick: handleStartDevSession,
            },
            {
              icon: <FaPlus />,
              children: "Add new",
              onClick: handleAddNewSimulation,
            },
          ]}
        />
      </div>
    </Drawer>
  );
}

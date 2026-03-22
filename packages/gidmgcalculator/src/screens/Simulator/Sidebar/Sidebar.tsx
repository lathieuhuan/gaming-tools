import { Button, ButtonGroup, Drawer } from "rond";

import { useSimulatorStore } from "../store";
import { SimulationList } from "./SimulationList";
import { FaPlus } from "react-icons/fa";
import { startNewSimulation } from "../actions/prepare";

export function Sidebar() {
  const sidebarOpen = useSimulatorStore((state) => state.sidebarOpen);

  const closeSidebar = () => useSimulatorStore.setState({ sidebarOpen: false });

  const handleAddNewSimulation = () => {
    startNewSimulation();
    closeSidebar();
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

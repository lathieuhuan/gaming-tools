import { SwitchNode } from "rond";

import { RootState } from "@Store/store";
import { useSelector } from "@Store/hooks";

// Component
import { ToolboxProvider } from "./ToolboxProvider";
import { SimulatorHeader } from "./SimulatorHeader";
import { SimulationMaker } from "./SimulationMaker";
import { SimulationManager } from "./SimulationManager";

const selectStage = (state: RootState) => state.simulator.stage;

export function Simulator() {
  const stage = useSelector(selectStage);

  return (
    <ToolboxProvider>
      <div className="h-full bg-surface-3 flex flex-col">
        <SimulatorHeader stage={stage} />

        <div className="grow overflow-hidden">
          <SwitchNode
            value={stage}
            cases={[
              {
                value: "PREPARING",
                element: <SimulationMaker />,
              },
              {
                value: "RUNNING",
                element: <SimulationManager />,
              },
            ]}
          />
        </div>
      </div>
    </ToolboxProvider>
  );
}

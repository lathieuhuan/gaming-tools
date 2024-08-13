import { SwitchNode } from "rond";

import { RootState } from "@Store/store";
import { useSelector } from "@Store/hooks";

// Component
import { ToolboxProvider } from "./ToolboxProvider";
import { SimulatorHeader } from "./SimulatorHeader";
import { SimulationMaker } from "./SimulationMaker";
import { SimulationRunner } from "./SimulationRunner";

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
                value: "ASSEMBLING",
                element: <SimulationMaker />,
              },
              {
                value: "RUNNING",
                element: <SimulationRunner />,
              },
            ]}
          />
        </div>
      </div>
    </ToolboxProvider>
  );
}

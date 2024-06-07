import { memo } from "react";

// Components
import { SimulatorModalsProvider, ToolboxProvider } from "@Simulator/SimulatorProviders";
import { MemberDetail, ModifyEventsMaker, SimulatorHeader } from "@Simulator/simulator-sections";

function SimulatorLargeCore() {
  return (
    <SimulatorModalsProvider>
      <div className="h-full bg-surface-2">
        <SimulatorHeader />

        <ToolboxProvider>
          <div className="flex">
            <div className="w-76">
              <MemberDetail />
            </div>
            <div className="w-76">
              <ModifyEventsMaker />
            </div>
          </div>
        </ToolboxProvider>
      </div>
    </SimulatorModalsProvider>
  );
}

export const SimulatorLarge = memo(SimulatorLargeCore);

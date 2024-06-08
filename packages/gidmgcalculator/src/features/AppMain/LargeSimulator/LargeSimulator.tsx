import { memo } from "react";

// Components
import {
  SimulatorModalsProvider,
  ToolboxProvider,
  MemberDetail,
  ModifyEventHost,
  SimulatorHeader,
} from "@Src/screens/Simulator";

function LargeSimulatorCore() {
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
              <ModifyEventHost />
            </div>
          </div>
        </ToolboxProvider>
      </div>
    </SimulatorModalsProvider>
  );
}

export const LargeSimulator = memo(LargeSimulatorCore);

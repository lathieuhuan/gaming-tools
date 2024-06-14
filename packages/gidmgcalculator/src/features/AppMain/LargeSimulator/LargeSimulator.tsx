import { memo } from "react";

// Components
import {
  SimulatorModalsProvider,
  ToolboxProvider,
  MemberDetail,
  ModifyEventHost,
  SimulatorHeader,
  HitEventHost,
  BonusDisplayer,
  Timeline,
} from "@Src/screens/Simulator";

function LargeSimulatorCore() {
  return (
    <SimulatorModalsProvider>
      <div className="h-full bg-surface-3 flex flex-col">
        <SimulatorHeader />

        <ToolboxProvider>
          <div className="px-4 py-3 grow overflow-hidden">
            <div className="h-full flex space-x-2 custom-scrollbar">
              <ModifyEventHost className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
              <HitEventHost className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />

              <div className="h-full grow overflow-auto shrink-0">
                <Timeline className="w-76 p-4 rounded-md bg-surface-1" />
              </div>

              <BonusDisplayer className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
              <MemberDetail className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
            </div>
          </div>
        </ToolboxProvider>
      </div>
    </SimulatorModalsProvider>
  );
}

export const LargeSimulator = memo(LargeSimulatorCore);

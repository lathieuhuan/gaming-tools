import { memo } from "react";

// Components
import {
  SimulatorModalsProvider,
  ToolboxProvider,
  MemberDetail,
  ModifyEventHost,
  SimulatorHeader,
  AttackEventHost,
} from "@Src/screens/Simulator";
import { BonusCenter } from "@Simulator/components/BonusCenter";

function LargeSimulatorCore() {
  return (
    <SimulatorModalsProvider>
      <div className="h-full bg-surface-3 flex flex-col">
        <SimulatorHeader />

        <ToolboxProvider>
          <div className="px-4 py-3 grow overflow-hidden">
            <div className="h-full flex space-x-2 custom-scrollbar">
              <ModifyEventHost className="w-76 p-4 h-full rounded-md bg-surface-2" />
              <AttackEventHost className="w-76 p-4 h-full rounded-md bg-surface-1" />
              <div className="grow"></div>
              <BonusCenter className="w-76 p-4 h-full rounded-md bg-surface-1" />
              <MemberDetail className="w-76 p-4 h-full rounded-md bg-surface-1 " />
            </div>
          </div>
        </ToolboxProvider>
      </div>
    </SimulatorModalsProvider>
  );
}

export const LargeSimulator = memo(LargeSimulatorCore);

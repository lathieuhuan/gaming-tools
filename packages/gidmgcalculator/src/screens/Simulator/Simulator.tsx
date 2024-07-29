import { useState } from "react";
import { BonusDisplayer } from "./BonusDisplayer";
import { HitEventHost } from "./HitEventHost";
import { MemberDetail } from "./MemberDetail";
import { ModifyEventHost } from "./ModifyEventHost";
import { SimulatorHeader } from "./SimulatorHeader";
import { SimulatorModalsProvider } from "./SimulatorModalsProvider";
import { Timeline } from "./Timeline";
import { ToolboxProvider } from "./ToolboxProvider";
import { SimulationStarter } from "./SimulationStarter";

export function Simulator() {
  const [starterActive, setStarterActive] = useState(false);

  return (
    <SimulatorModalsProvider>
      <div className="h-full bg-surface-3 flex flex-col">
        <SimulatorHeader onClickAddSimulation={() => setStarterActive(true)} />

        <div className="grow overflow-hidden">{starterActive ? <SimulationStarter /> : <SimulationManager />}</div>
      </div>
    </SimulatorModalsProvider>
  );
}

function SimulationManager() {
  return (
    <ToolboxProvider>
      <div className="px-4 py-3 grow overflow-hidden">
        <div className="h-full flex space-x-2 custom-scrollbar">
          <ModifyEventHost className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
          <HitEventHost className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />

          <div className="h-full grow overflow-auto shrink-0">
            <Timeline className="px-3 py-4 rounded-md bg-surface-1" />
          </div>

          <BonusDisplayer className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
          <MemberDetail className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
        </div>
      </div>
    </ToolboxProvider>
  );
}

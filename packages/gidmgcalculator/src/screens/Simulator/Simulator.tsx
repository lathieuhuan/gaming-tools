import { SwitchNode } from "rond";

import { RootState } from "@Store/store";
import { useSelector } from "@Store/hooks";

// Component
import { SimulatorHeader } from "./SimulatorHeader";
import { SimulationMaker } from "./SimulationMaker";
import { ToolboxProvider } from "./ToolboxProvider";
import { BonusDisplayer } from "./BonusDisplayer";
import { HitEventHost } from "./HitEventHost";
import { MemberDetail } from "./MemberDetail";
import { ModifyEventHost } from "./ModifyEventHost";
import { Timeline } from "./Timeline";

const selectStage = (state: RootState) => state.simulator.stage;

export function Simulator() {
  const stage = useSelector(selectStage);

  return (
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
  );
}

function SimulationManager() {
  return (
    <ToolboxProvider>
      <div className="px-4 py-3 h-full overflow-hidden">
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

import { clsx } from "rond";

import { useSelector } from "@Store/hooks";
import { selectActiveSimulationId } from "@Store/simulator-slice";
import { Timeline } from "./Timeline";
import { BonusDisplayer } from "./BonusDisplayer";
import { HitEventHost } from "./HitEventHost";
import { MemberDetail } from "./MemberDetail";
import { ModifyEventHost } from "./ModifyEventHost";
import { EventLog } from "./EventLog";
import { PartyControlBar } from "./PartyControlBar";

export function SimulationManager() {
  const activeId = useSelector(selectActiveSimulationId);
  const panelCls = "w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0";

  return (
    <div className="px-4 py-3 h-full flex justify-end">
      <div className="flex flex-col overflow-hidden">
        <div className="p-4">
          <Timeline />
        </div>

        <div className="pb-2 grow flex space-x-2 custom-scrollbar">
          <MemberDetail key={`member-${activeId}`} className={clsx("w-76", panelCls)} />
          <EventLog key={`timeline-${activeId}`} className={clsx("w-80 pr-2", panelCls)} />
          <ModifyEventHost key={`modify-${activeId}`} className={clsx("w-76", panelCls)} />
          <HitEventHost key={`hit-${activeId}`} className={clsx("w-76", panelCls)} />
        </div>
      </div>

      <PartyControlBar className="ml-6" />
    </div>
  );
}

import { useSelector } from "@Store/hooks";
import { selectActiveSimulationId } from "@Store/simulator-slice";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";

// Component
import { OnFieldMemberWatch } from "./components";
import { Timeline } from "./Timeline";
// import { MemberDetail } from "./MemberDetail";
import { BonusDisplayer } from "./BonusDisplayer";
import { EventLog } from "./EventLog";
import { ModifyEventHost } from "./ModifyEventHost";
import { HitEventHost } from "./HitEventHost";
import { PartyControlBar } from "./PartyControlBar";

export function SimulationManager() {
  const activeId = useSelector(selectActiveSimulationId);
  const simulation = useActiveSimulation();
  const panelCls = "h-full rounded-md bg-surface-1 overflow-auto shrink-0";

  if (!simulation) {
    return null;
  }

  return (
    <OnFieldMemberWatch className="px-4 py-3 h-full grid grid-cols-[1fr_10rem] gap-6 overflow-auto">
      <div>
        <div className="ml-auto px-4" style={{ maxWidth: "78.5rem" }}>
          <Timeline simulation={simulation} />
        </div>
      </div>
      <div />

      <div className="h-full flex justify-end overflow-auto">
        <div className="h-full pb-2 flex space-x-2 overflow-auto">
          {/* <MemberDetail key={`member-${activeId}`} className={[panelCls, "w-76"]} simulation={simulation} /> */}
          <BonusDisplayer key={`bonuses-${activeId}`} className={`${panelCls} w-76 p-4`} simulation={simulation} />
          <EventLog key={`timeline-${activeId}`} className={[panelCls, "w-80"]} simulation={simulation} />
          <ModifyEventHost key={`modify-${activeId}`} className={[panelCls, "w-76"]} simulation={simulation} />
          <HitEventHost key={`hit-${activeId}`} className={[panelCls, "w-76"]} />
        </div>
      </div>

      <PartyControlBar className="py-4" simulation={simulation} />
    </OnFieldMemberWatch>
  );
}

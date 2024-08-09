import { useSelector } from "@Store/hooks";
import { selectActiveSimulationId } from "@Store/simulator-slice";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";

// Component
import { OnFieldMemberWatch } from "./components";
import { Timeline } from "./Timeline";
import { MemberDetail } from "./MemberDetail";
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
    <OnFieldMemberWatch
      className="px-4 py-3 h-full grid gap-6 overflow-auto"
      style={{
        gridTemplateColumns: "1fr 10rem",
        gridTemplateRows: "5rem 1fr",
      }}
    >
      <div>
        <div className="h-full ml-auto px-4" style={{ maxWidth: "78.5rem" }}>
          <Timeline key={`timeline-${activeId}`} simulation={simulation} />
        </div>
      </div>
      <div />

      <div className="h-full flex justify-end overflow-auto">
        <div className="h-full pb-2 flex space-x-2 overflow-auto">
          <MemberDetail key={`member-${activeId}`} className={[panelCls, "w-76"]} simulation={simulation} />
          <BonusDisplayer key={`bonuses-${activeId}`} className={`${panelCls} w-76 p-4`} simulation={simulation} />
          <EventLog key={`events-${activeId}`} className={[panelCls, "w-80"]} simulation={simulation} />
          <ModifyEventHost key={`modify-${activeId}`} className={[panelCls, "w-76"]} simulation={simulation} />
          <HitEventHost key={`hit-${activeId}`} className={[panelCls, "w-76"]} />
        </div>
      </div>

      <PartyControlBar key={`party-${activeId}`} className="py-4" simulation={simulation} />
    </OnFieldMemberWatch>
  );
}

import { useSimulatorStore } from "./store";

// Components
import { ActiveMemberView } from "./ActiveMemberView";
import { AnalyticsView } from "./AnalyticsView";
import { EventLauncher } from "./EventLauncher";
import { Sidebar } from "./Sidebar";
import { TeamAssembler } from "./TeamAssembler";
import { TimelineView } from "./TimelineView";
import { TopBar } from "./Topbar";

const containerCls = "w-78 p-4 bg-dark-1 rounded-md shrink-0";

export function Simulator() {
  const phase = useSimulatorStore((state) => state.phase);
  const isEmpty = useSimulatorStore(
    (state) => !state.activeId || !state.simulationsById[state.activeId]
  );

  return (
    <div className="h-full flex flex-col bg-dark-3">
      <TopBar phase={phase} noActiveSimulation={isEmpty} />

      {phase === "PREP" ? (
        !isEmpty && <TeamAssembler className="grow" />
      ) : (
        <div className="p-4 grow flex gap-4 hide-scrollbar">
          <ActiveMemberView className={containerCls} />
          <EventLauncher className={containerCls} />
          <TimelineView className={containerCls} />
          <AnalyticsView className={containerCls} />
        </div>
      )}

      <Sidebar />
    </div>
  );
}

import { useSimulatorStore } from "./store";
import { startBuilding } from "./actions/build";

// Components
import { ActiveMemberView } from "./ActiveMemberView";
import { AnalyticsView } from "./AnalyticsView";
import { EventMenu } from "./EventMenu";
import { IntroTopBar } from "./IntroTopBar";
import { SimulationPrepper } from "./SimulationPrepper";
import { TimelineView } from "./TimelineView";

const containerCls = "w-78 p-4 bg-dark-1 rounded-md shrink-0";

export function Simulator() {
  const step = useSimulatorStore((state) => state.step);

  return (
    <div className="h-full bg-dark-3">
      {step === "PREP" ? (
        <SimulationPrepper onStart={startBuilding} />
      ) : (
        <div className="h-full flex flex-col">
          <IntroTopBar />

          <div className="p-4 grow flex gap-4 hide-scrollbar">
            <ActiveMemberView className={containerCls} />
            <EventMenu className={containerCls} />
            <TimelineView className={containerCls} />
            <AnalyticsView className={containerCls} />

            {/* <div className="h-full grow flex flex-col gap-4 overflow-hidden">
              <ActiveMemberView className="grow p-4 bg-dark-1 rounded-md overflow-y-hidden" />
              <TimelineView className="p-4 bg-dark-1 rounded-md" />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}

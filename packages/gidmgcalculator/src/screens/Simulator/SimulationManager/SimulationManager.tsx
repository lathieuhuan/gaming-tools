import { useSelector } from "@Store/hooks";
import { selectActiveSimulationId } from "@Store/simulator-slice";
import { BonusDisplayer } from "./BonusDisplayer";
import { HitEventHost } from "./HitEventHost";
import { MemberDetail } from "./MemberDetail";
import { ModifyEventHost } from "./ModifyEventHost";
import { Timeline } from "./Timeline";

export function SimulationManager() {
  const activeId = useSelector(selectActiveSimulationId);

  return (
    <div className="px-4 py-3 h-full overflow-hidden">
      <div className="h-full flex space-x-2 custom-scrollbar">
        <ModifyEventHost key={`modify-${activeId}`} className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
        <HitEventHost key={`hit-${activeId}`} className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />

        <div className="h-full grow overflow-auto shrink-0">
          <Timeline key={`timeline-${activeId}`} className="px-3 py-4 rounded-md bg-surface-1" />
        </div>

        <BonusDisplayer key={`bonuses-${activeId}`} className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
        <MemberDetail key={`member-${activeId}`} className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
      </div>
    </div>
  );
}

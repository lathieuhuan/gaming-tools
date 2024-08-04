import { BonusDisplayer } from "./BonusDisplayer";
import { HitEventHost } from "./HitEventHost";
import { MemberDetail } from "./MemberDetail";
import { ModifyEventHost } from "./ModifyEventHost";
import { Timeline } from "./Timeline";

export function SimulationManager() {
  return (
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
  );
}

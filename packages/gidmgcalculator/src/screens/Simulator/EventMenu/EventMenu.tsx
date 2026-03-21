import { clsx } from "rond";

import { selectMember } from "../actions/build";
import { selectActiveMember, selectSimulation, useSimulatorStore } from "../store";

// Components
import { CharacterPortrait } from "@/components";
import { HitEventMenu } from "./HitEventMenu";

type EventMenuProps = {
  className?: string;
};

export function EventMenu({ className }: EventMenuProps) {
  const members = useSimulatorStore((state) => selectSimulation(state).members);
  const memberOrder = useSimulatorStore((state) => selectSimulation(state).memberOrder);
  const activeMember = useSimulatorStore(selectActiveMember);

  return (
    <div className={className}>
      <div className="flex gap-2">
        {memberOrder.map((code, index) => {
          const member = members[code];
          const selected = code === activeMember.code;

          return (
            <div key={index}>
              <CharacterPortrait
                className={clsx(selected ? "shadow-hightlight-2 shadow-light-1" : "cursor-pointer")}
                size="small"
                zoomable={!selected}
                info={member.data}
                onClick={() => selectMember(code)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <HitEventMenu data={activeMember.data} />
      </div>
    </div>
  );
}

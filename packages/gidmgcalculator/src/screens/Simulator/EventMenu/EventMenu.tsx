import { Button, clsx, cn } from "rond";

import { selectMember, switchIn } from "../actions/build";
import { selectActiveMember, selectProcessor, selectSimulation, useSimulatorStore } from "../store";

// Components
import { CharacterPortrait } from "@/components";
import { HitEventMenu } from "./HitEventMenu";

type EventMenuProps = {
  className?: string;
};

export function EventMenu({ className }: EventMenuProps) {
  const members = useSimulatorStore((state) => selectSimulation(state).members);
  const memberOrder = useSimulatorStore((state) => selectSimulation(state).memberOrder);
  const onFieldMember = useSimulatorStore((state) => selectProcessor(state).onFieldMember);
  const activeMember = useSimulatorStore(selectActiveMember);

  const activeMemberIsOnField = activeMember.code === onFieldMember;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex gap-2">
        {memberOrder.map((code, index) => {
          const member = members[code];
          const selected = code === activeMember.code;

          return (
            <div key={index}>
              <CharacterPortrait
                className={clsx(selected ? "shadow-hightlight-2 shadow-active" : "cursor-pointer")}
                size="small"
                info={member.data}
                onClick={() => selectMember(code)}
              />
            </div>
          );
        })}
      </div>

      <div className="grow mt-6 flex flex-col gap-3 custom-scrollbar">
        <div className="flex items-center">
          <Button
            size="small"
            className="ml-auto"
            disabled={activeMemberIsOnField}
            onClick={() => switchIn(activeMember.code)}
          >
            {activeMemberIsOnField ? "On-field" : "Take the field"}
          </Button>
        </div>

        <div className="mx-auto h-px w-1/2 bg-dark-3" />

        <HitEventMenu className="grow custom-scrollbar" data={activeMember.data} />
      </div>
    </div>
  );
}

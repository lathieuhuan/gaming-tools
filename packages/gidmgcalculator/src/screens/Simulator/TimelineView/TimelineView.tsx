import { clsx } from "rond";

import { selectSimulation, useSimulatorStore } from "../store";

// Components
import { GenshinImage } from "@/components";
import { CharacterEventView } from "./CharacterEventView";

type TimelineViewProps = {
  className?: string;
};

export function TimelineView({ className }: TimelineViewProps) {
  const timeline = useSimulatorStore((state) => selectSimulation(state).timeline);
  const members = useSimulatorStore((state) => selectSimulation(state).members);
  const onFieldMember = useSimulatorStore((state) => {
    const { processor, members } = selectSimulation(state);
    return members[processor.onFieldMember];
  });

  return (
    <div className={className}>
      <div className="flex flex-col-reverse gap-2 peer">
        {timeline.map((event, index) => {
          switch (event.cate) {
            case "C": {
              const member = members[event.performer];
              const { sideIcon, icon } = member.data;

              return (
                <div key={event.id} className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "size-8 min-w-8 rounded-circle bg-dark-3",
                      sideIcon ? "" : "overflow-hidden"
                    )}
                  >
                    <div className="w-ful h-full">
                      <GenshinImage
                        src={sideIcon || icon}
                        alt="icon"
                        imgCls={`max-w-none ${
                          sideIcon
                            ? "w-12 -translate-x-2 -translate-y-4"
                            : "w-9 -translate-x-0.5 translate-y-0.5"
                        }`}
                        fallbackCls="p-2"
                      />
                    </div>
                  </div>
                  <CharacterEventView event={event} character={member} />
                </div>
              );
            }
            case "E": {
              return <div key={event.id}>Environment</div>;
            }
            default: {
              event satisfies never;
            }
          }
        })}
      </div>

      <div className="hidden peer-empty:block">{onFieldMember.data.name}</div>
    </div>
  );
}

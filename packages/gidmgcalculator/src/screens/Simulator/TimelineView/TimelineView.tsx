import { ClassValue, clsx } from "rond";

import { EEventCategory } from "../configs";
import { selectProcessor, useSimulatorStore } from "../store";

// Components
import { GenshinImage } from "@/components";
import { MemberEventView } from "./MemberEventView";

type TimelineViewProps = {
  className?: ClassValue;
};

export function TimelineView({ className }: TimelineViewProps) {
  const timeline = useSimulatorStore((state) => selectProcessor(state).timeline);
  const team = useSimulatorStore((state) => selectProcessor(state).team);

  const onFieldMember = team.onFieldMember;

  return (
    <div className={clsx(className)}>
      <div className="flex flex-col-reverse gap-2 peer">
        {timeline.map((event) => {
          switch (event.cate) {
            case EEventCategory.MEMBER: {
              const { name, sideIcon, icon } = event.performer;

              return (
                <div key={event.id} className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "size-8 min-w-8 rounded-circle bg-dark-3",
                      sideIcon ? "" : "overflow-hidden"
                    )}
                    title={name}
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
                  <MemberEventView event={event} />
                </div>
              );
            }
            case EEventCategory.TEAM: {
              return <div key={event.id}>Team</div>;
            }
            case EEventCategory.ENVIRONMENT: {
              return <div key={event.id}>Environment</div>;
            }
            case EEventCategory.ERROR: {
              return <div key={event.id}>Error</div>;
            }
            default: {
              event satisfies never;
              return null;
            }
          }
        })}
      </div>

      <div className="hidden peer-empty:block">{onFieldMember.data.name}</div>
    </div>
  );
}

import { selectSimulation, useSimulatorStore } from "../store";
import { EventMetadata, SimulationEvent } from "../types";

type ReconciledEvent = SimulationEvent & {
  meta: EventMetadata;
};

type TimelineViewProps = {
  className?: string;
};

export function TimelineView({ className }: TimelineViewProps) {
  const eventsByMember = useSimulatorStore((state) => selectSimulation(state).eventsByMember);
  const timeline = useSimulatorStore((state) => selectSimulation(state).timeline);
  const memberOrder = useSimulatorStore((state) => selectSimulation(state).memberOrder);
  const members = useSimulatorStore((state) => selectSimulation(state).members);

  const timelinesByMember = new Map<number, ReconciledEvent[]>();

  for (const code of memberOrder) {
    timelinesByMember.set(code, []);
  }

  for (const meta of timeline) {
    if (meta.performer.type !== "M") {
      continue;
    }

    const memberCode = meta.performer.code;
    const memberTimeline = timelinesByMember.get(memberCode) || [];
    const event = eventsByMember[memberCode][meta.id];

    memberTimeline.push({
      ...event,
      meta,
    });
  }

  return (
    <div className={className}>
      {memberOrder.map((code) => {
        const member = members[code];
        const memberTimeline = timelinesByMember.get(code) || [];

        return (
          <div key={code}>
            <div>{member.data.name}</div>

            {memberTimeline.map((event) => {
              console.log(event);
              return <div key={event.id}>{event.type}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

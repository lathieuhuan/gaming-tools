import { FaExclamationCircle } from "react-icons/fa";
import type { SimulationManager, SimulationProcessedEvent } from "@Simulator/ToolboxProvider";
import { GenshinImage } from "@Src/components";

interface EventDisplayerProps {
  simulation: SimulationManager;
  event: SimulationProcessedEvent;
}
export function EventDisplayer(props: EventDisplayerProps) {
  const { event } = props;

  let sideIconNode: React.ReactNode = null;
  let descriptionNode: React.ReactNode = null;
  let extraNode: React.ReactNode = null;

  if (event.type === "SYSTEM_MODIFY") {
    sideIconNode = <span>S</span>;
    descriptionNode = event.description;
  } else {
    const performer = props.simulation.getMemberData(event.performer.code);

    sideIconNode = (
      <GenshinImage
        title={performer?.name}
        className="w-7 h-7 shrink-0 relative"
        imgCls="absolute"
        imgStyle={{
          maxWidth: "none",
          width: "130%",
          top: "-9px",
          left: "-6px",
        }}
        fallbackCls="p-0.5"
        src={performer?.sideIcon}
      />
    );

    switch (event.type) {
      case "ENTITY_MODIFY": {
        descriptionNode = (
          <>
            <span className="opacity-80">Trigger</span> {event.description}
          </>
        );
        break;
      }
      case "HIT": {
        descriptionNode = event.description;
        extraNode = <span className="ml-auto font-semibold">{event.damage.value}</span>;
      }
    }
  }

  return (
    <div className="p-1 pr-2 text-sm flex items-center">
      {sideIconNode}
      <p className="px-2 truncate">{descriptionNode}</p>

      <div className="ml-auto flex items-center gap-2">
        {extraNode}
        {event.error ? <FaExclamationCircle className="text-2xl text-danger-2" /> : null}
      </div>
    </div>
  );
}

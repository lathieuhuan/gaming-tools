import { SimulationProcessedEvent } from "@Simulator/ToolboxProvider";
import { FaExclamationCircle } from "react-icons/fa";

interface EventDisplayerProps {
  sideIconNode: React.ReactNode;
  event: SimulationProcessedEvent;
}
export function EventDisplayer({ sideIconNode, event }: EventDisplayerProps) {
  const errorNode = event.error ? (
    <span className="ml-auto">
      <FaExclamationCircle className="text-2xl text-danger-2" />
    </span>
  ) : null;

  switch (event.type) {
    case "MODIFY": {
      return (
        <div className="flex items-center">
          {sideIconNode}
          <div className="px-3 truncate">
            <span className="text-light-default/60">Trigger</span> {event.description}
          </div>
          {errorNode}
        </div>
      );
    }
    case "HIT": {
      return (
        <div className="flex items-center">
          {sideIconNode}
          <div className="px-3 truncate">{event.description}</div>
          <div className="ml-auto flex items-center gap-2">
            <span className="font-semibold">{event.damage.value}</span>
            {errorNode}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

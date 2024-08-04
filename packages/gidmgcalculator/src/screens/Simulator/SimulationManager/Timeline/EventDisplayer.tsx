import { FaExclamationCircle } from "react-icons/fa";
import { SimulationProcessedEvent } from "@Simulator/simulation-control";

interface EventDisplayerProps {
  sideIconNode: React.ReactNode;
  event: SimulationProcessedEvent;
}
export function EventDisplayer({ sideIconNode, event }: EventDisplayerProps) {
  const containerCls = "p-1 pr-2 text-sm rounded flex items-center hover:bg-surface-2 cursor-default";

  const errorNode = event.error ? (
    <span className="ml-auto">
      <FaExclamationCircle className="text-2xl text-danger-2" />
    </span>
  ) : null;

  switch (event.type) {
    case "MODIFY": {
      return (
        <div className={containerCls}>
          {sideIconNode}
          <div className="px-2 truncate">
            <span className="text-light-default/60">Trigger</span> {event.description}
          </div>
          {errorNode}
        </div>
      );
    }
    case "HIT": {
      return (
        <div className={containerCls}>
          {sideIconNode}
          <div className="px-2 truncate">{event.description}</div>
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

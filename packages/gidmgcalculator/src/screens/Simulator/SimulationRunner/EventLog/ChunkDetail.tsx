import { ButtonGroup } from "rond";

import { useDispatch } from "@Store/hooks";
import { removeEvent } from "@Store/simulator-slice";
import { SimulationManager, SimulationProcessedChunk, SimulationProcessedEvent } from "@Simulator/ToolboxProvider";
import { FaTrashAlt } from "react-icons/fa";

interface ChunkDetailProps {
  simulation: SimulationManager;
  chunk: SimulationProcessedChunk;
  event?: SimulationProcessedEvent;
}
export function ChunkDetail({ simulation, chunk, event }: ChunkDetailProps) {
  const dispatch = useDispatch();
  const totalDMG = chunk.events.reduce((total, event) => total + (event.type === "HIT" ? event.damage.value : 0), 0);

  const chunkDetails = [
    {
      label: "On-field",
      value: simulation.getMemberInfo(chunk.ownerCode).name,
    },
    {
      label: "Total Damage",
      value: totalDMG,
    },
  ];

  if (simulation.timeOn) {
    chunkDetails.push({
      label: "Total Duration",
      value: `${chunk.events.reduce((total, event) => total + event.duration, 0) / 100}s`,
    });
  }

  const eventLabelByType: Record<SimulationProcessedEvent["type"], string> = {
    HIT: "Hit",
    ENTITY_MODIFY: "Modify",
    SYSTEM_MODIFY: "Modify",
  };

  const renderEventContent = (event: SimulationProcessedEvent) => {
    switch (event.type) {
      case "HIT":
        return (
          <div>
            <div>
              Damage <span className={`text-${event.damage.element}`}>{event.damage.value}</span>
            </div>
          </div>
        );
      // case "ENTITY_MODIFY":
      // case "SYSTEM_MODIFY":
      default:
        return null;
    }
  };

  return (
    <div className="p-4 text-sm">
      <p className="text-xs text-hint-color">Chunk</p>

      <div className="mt-1" style={{ width: totalDMG > 99_999_999 ? "80%" : "70%" }}>
        {chunkDetails.map((detail, i) => {
          return (
            <div key={i} className="flex justify-between">
              <span>{detail.label}</span>
              <span>{detail.value}</span>
            </div>
          );
        })}
      </div>

      {event ? (
        <>
          <div className="my-3 h-px bg-surface-border" />

          <div>
            <p className="text-xs text-hint-color">{eventLabelByType[event.type]} Event</p>

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">{event.description}</span>
              {simulation.timeOn && <span>{event.duration / 100}(s)</span>}
            </div>

            {renderEventContent(event)}
          </div>

          {/* <div>
            <p className="text-xs text-hint-color">Performer</p>
          </div> */}

          <ButtonGroup
            className="mt-2"
            justify="end"
            buttons={[
              {
                title: "Remove",
                icon: <FaTrashAlt />,
                onClick: () =>
                  dispatch(
                    removeEvent({
                      chunkId: chunk.id,
                      eventId: event.id,
                    })
                  ),
              },
            ]}
          />
        </>
      ) : null}
    </div>
  );
}

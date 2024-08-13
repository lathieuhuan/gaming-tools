import { ButtonGroup } from "rond";

import { useDispatch } from "@Store/hooks";
import { SimulationManager, SimulationProcessedChunk, SimulationProcessedEvent } from "@Simulator/ToolboxProvider";
import { removeEvent } from "@Store/simulator-slice";

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
      value: chunk.events.reduce((total, event) => total + event.duration, 0) + "(s)",
    });
  }

  return (
    <div className="p-4 text-sm">
      <p className="text-xs text-hint-color">Chunk</p>

      <div className="mt-1" style={{ width: totalDMG > 99_999_999 ? "70%" : "60%" }}>
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
          <div className="my-4 h-px bg-surface-border" />
          <p className="text-xs text-hint-color">Event</p>

          <div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">{event.description}</span>
              {simulation.timeOn && <span>{event.duration}(s)</span>}
            </div>

            {event.type === "HIT" ? (
              <div>
                Damage <span className={`text-${event.damage.element}`}>{event.damage.value}</span>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          <ButtonGroup
            justify="end"
            buttons={[
              {
                children: "Remove",
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

import { ButtonGroup } from "rond";

import { useDispatch } from "@Store/hooks";
import { SimulationProcessedChunk, SimulationProcessedEvent } from "@Simulator/ToolboxProvider";
import { removeEvent } from "@Store/simulator-slice";

interface ChunkDetailProps {
  chunk: SimulationProcessedChunk;
  event?: SimulationProcessedEvent;
}
export function ChunkDetail({ chunk, event }: ChunkDetailProps) {
  const dispatch = useDispatch();
  const totalDMG = chunk.events.reduce((total, event) => total + (event.type === "HIT" ? event.damage.value : 0), 0);

  return (
    <div className="p-4">
      <p>Total DMG {totalDMG}</p>

      {event ? (
        <>
          <div className="my-4 h-px bg-surface-border" />

          <div>{event.id}</div>

          <ButtonGroup
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

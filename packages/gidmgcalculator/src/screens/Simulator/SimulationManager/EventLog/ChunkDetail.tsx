import { SimulationProcessedChunk, SimulationProcessedEvent } from "@Simulator/ToolboxProvider";

interface ChunkDetailProps {
  chunk: SimulationProcessedChunk;
  event?: SimulationProcessedEvent;
}
export function ChunkDetail({ chunk, event }: ChunkDetailProps) {
  const totalDMG = chunk.events.reduce((total, event) => total + (event.type === "HIT" ? event.damage.value : 0), 0);

  return (
    <div className="p-4">
      <p>Total DMG {totalDMG}</p>

      {event ? (
        <>
          <div className="my-4 h-px bg-surface-border" />

          <div>{event.id}</div>
        </>
      ) : null}
    </div>
  );
}

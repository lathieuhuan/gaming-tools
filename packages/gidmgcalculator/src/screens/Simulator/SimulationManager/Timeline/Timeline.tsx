import { useEffect, useMemo, useState } from "react";
import { SimulationChunk } from "@Src/types";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";

import "./Timeline.styles.scss";

const PIXELS_PER_SECOND = 32;

export function Timeline() {
  const [chunks, setChunks] = useState<SimulationChunk[]>([]);
  const simulation = useActiveSimulation();

  const colorsByCode = useMemo(() => {
    const colors = ["red", "yellow", "green", "blue"];
    const result: Record<number, string> = {};

    if (simulation) {
      for (let i = 0; i < simulation.partyData.length; i++) {
        const member = simulation.partyData[i];
        result[member.code] = colors[i];
      }
    }
    return result;
  }, [simulation]);

  useEffect(() => {
    if (simulation) {
      const { initialChunks, unsubscribe } = simulation.subscribeChunks(setChunks);

      setChunks(initialChunks);
      return unsubscribe;
    }
    return undefined;
  }, [simulation]);

  return (
    <div>
      <div className="timeline flex relative after:bg-hint-color">
        {chunks.map((chunk) => {
          const chunkDuration = simulation?.timeOn
            ? chunk.events.reduce((duration, event) => duration + event.duration, 0)
            : chunk.events.length;
          const color = colorsByCode[chunk.ownerCode];

          return (
            <div key={chunk.id} className="h-10 flex items-center relative z-10">
              <div className="h-1" style={{ backgroundColor: color, width: chunkDuration * PIXELS_PER_SECOND }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

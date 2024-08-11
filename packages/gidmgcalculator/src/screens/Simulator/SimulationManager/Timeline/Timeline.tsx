import { useEffect, useMemo, useState } from "react";
import { Popover } from "rond";

import { CharacterPortrait } from "@Src/components";
import { SimulationManager, SimulationSumary, type SimulationProcessedChunk } from "@Simulator/ToolboxProvider";
import { useTimelineTracker } from "@Simulator/hooks";

import "./Timeline.styles.scss";

const PIXELS_PER_SECOND = 32;

type SyncState = {
  chunks: SimulationProcessedChunk[];
  sumary: SimulationSumary;
};

interface TimelineProps {
  simulation: SimulationManager;
}
export function Timeline({ simulation }: TimelineProps) {
  const [{ chunks, sumary }, setState] = useState<SyncState>({
    chunks: [],
    sumary: {
      damage: 0,
      duration: 0,
    },
  });
  const { timelineRef, selectedChunkId, getChunkProps } = useTimelineTracker();

  const colorsByCode = useMemo(() => {
    const colors = ["red", "yellow", "green", "blue"];
    const result: Record<number, string> = {};

    for (let i = 0; i < simulation.partyData.length; i++) {
      const member = simulation.partyData[i];
      result[member.code] = colors[i];
    }
    return result;
  }, [simulation]);

  useEffect(() => {
    const { initialChunks, initialSumary, unsubscribe } = simulation.subscribeChunks((chunks, sumary) =>
      setState({ chunks, sumary })
    );

    setState({
      chunks: initialChunks,
      sumary: initialSumary,
    });
    return unsubscribe;
  }, [simulation]);

  return (
    <div className="h-full px-4 rounded-sm bg-black/40 flex flex-col justify-end">
      <div className="flex items-center">
        <div ref={timelineRef} className="timeline grow flex relative after:bg-hint-color/60">
          {chunks.map((chunk) => {
            const chunkDuration = simulation.timeOn
              ? chunk.events.reduce((duration, event) => duration + event.duration, 0)
              : chunk.events.length;
            const color = colorsByCode[chunk.ownerCode];
            const selected = chunk.id === selectedChunkId;
            const owner = simulation.getMemberData(chunk.ownerCode);

            return (
              <div
                key={chunk.id}
                className={`h-10 flex items-center relative z-10 ${selected ? "bg-black" : "hover:bg-black/40"}`}
                {...getChunkProps(chunk.id)}
              >
                <Popover
                  active={selected}
                  className="left-1/2 bottom-8"
                  style={{ translate: "-50% 0" }}
                  as="div"
                  origin="bottom center"
                >
                  <CharacterPortrait className="w-8 h-8" size="custom" info={owner} />
                </Popover>

                <div className="h-1" style={{ backgroundColor: color, width: chunkDuration * PIXELS_PER_SECOND }} />
              </div>
            );
          })}
        </div>

        <div className="ml-2 h-14 text-secondary-1 text-lg font-bold">
          <div className="text-right">{sumary.damage}</div>
          {simulation.timeOn && (
            <div>
              {sumary.damage}
              <span className="text-hint-color text-sm">(s)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

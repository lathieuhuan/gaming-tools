import { useEffect, useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";
import { clsx, type ClassValue } from "rond";

import type { SimulationProcessedChunk, SimulationManager } from "@Simulator/ToolboxProvider";
import { useTimelineTracker } from "@Simulator/hooks";

// Component
import { GenshinImage } from "@Src/components";
import { EventDisplayer } from "./EventDisplayer";

interface EventLogProps {
  className?: ClassValue;
  simulation: SimulationManager;
}
export function EventLog({ className, simulation }: EventLogProps) {
  const [chunks, setChunks] = useState<SimulationProcessedChunk[]>([]);
  const { timelineRef, selectedChunkId, getChunkProps } = useTimelineTracker();

  useEffect(() => {
    const { initialChunks, unsubscribe } = simulation.subscribeChunks(setChunks);

    setChunks(initialChunks);
    return unsubscribe;
  }, [simulation]);

  return (
    <div className={clsx("px-2 py-4", className)}>
      <div className="h-full flex flex-col">
        <div className="pl-2 flex items-center gap-1">
          <h4 className="text-lg text-heading-color font-semibold">Event Log</h4>
          <span>
            <FaLongArrowAltUp className="rotate-180" />
          </span>
        </div>

        {/* <div className="flex">
          <span className="ml-auto px-2 rounded hover:bg-surface-2 cursor-default">
            <span className="text-sm">Total DMG:</span>{" "}
            <span className="text-lg text-secondary-1 font-bold">{sumary.damage}</span>
          </span>
        </div> */}

        <div ref={timelineRef} className="mt-2 pr-2 grow custom-scrollbar scroll-smooth">
          {chunks.map((chunk) => {
            return (
              <div
                key={chunk.id}
                className={clsx(`rounded overflow-hidden`, chunk.id === selectedChunkId && "bg-surface-3")}
                {...getChunkProps(chunk.id)}
              >
                {chunk.events.map((event) => {
                  const performer = simulation.getMemberData(event.performer.code);

                  return (
                    <EventDisplayer
                      key={event.id}
                      sideIconNode={
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
                      }
                      event={event}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

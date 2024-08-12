import { useEffect, useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";
import { CloseButton, HiddenSpace, clsx, type ClassValue } from "rond";

import {
  type SimulationProcessedChunk,
  type SimulationManager,
  SimulationProcessedEvent,
} from "@Simulator/ToolboxProvider";
import { useTimelineTracker } from "@Simulator/hooks";

// Component
import { EventDisplayer } from "./EventDisplayer";
import { ChunkDetail } from "./ChunkDetail";

interface EventLogProps {
  className?: ClassValue;
  simulation: SimulationManager;
}
export function EventLog({ className, simulation }: EventLogProps) {
  const [chunks, setChunks] = useState<SimulationProcessedChunk[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SimulationProcessedEvent>();
  const { timelineRef, selectedChunkId, unSelectChunk, getChunkProps } = useTimelineTracker();
  const selectedChunk = chunks.find((chunk) => chunk.id === selectedChunkId);

  useEffect(() => {
    const { initialChunks, unsubscribe } = simulation.subscribeChunks(setChunks);

    setChunks(initialChunks);
    return unsubscribe;
  }, [simulation]);

  useEffect(() => {
    if (selectedEvent && !selectedChunk?.events.includes(selectedEvent)) {
      setSelectedEvent(undefined);
    }
  }, [selectedChunk]);

  return (
    <div className="flex">
      <div className={clsx("px-2 py-4", className)}>
        <div className="h-full flex flex-col">
          <div className="pl-2 flex items-center gap-1">
            <h4 className="text-lg text-heading-color font-semibold">Event Log</h4>
            <span>
              <FaLongArrowAltUp className="text-hint-color rotate-180" />
            </span>
          </div>

          <div ref={timelineRef} className="mt-2 pr-2 grow custom-scrollbar scroll-smooth">
            {chunks.map((chunk) => {
              return (
                <div
                  key={chunk.id}
                  className={clsx(`rounded overflow-hidden`, chunk.id === selectedChunkId && "bg-surface-3")}
                  {...getChunkProps(chunk.id)}
                >
                  {chunk.events.map((event) => {
                    return (
                      <div
                        key={event.id}
                        className={`rounded cursor-default ${
                          event.id === selectedEvent?.id
                            ? "bg-primary-1 text-black font-semibold"
                            : "hover:bg-surface-2 font-medium"
                        }`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <EventDisplayer simulation={simulation} event={event} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <HiddenSpace active={!!selectedChunk} className="py-2 flex">
        <div className={clsx("h-full ml-px rounded-l-none relative", className)}>
          <CloseButton boneOnly className="absolute top-1 right-1" onClick={unSelectChunk} />

          {selectedChunk ? <ChunkDetail chunk={selectedChunk} event={selectedEvent} /> : null}
        </div>
      </HiddenSpace>
    </div>
  );
}

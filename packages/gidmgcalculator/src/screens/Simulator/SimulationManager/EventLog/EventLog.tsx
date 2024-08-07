import { Fragment, useEffect, useState } from "react";
import { clsx } from "rond";

import type { SimulationProcessedChunk, SimulationSumary } from "@Simulator/ToolboxProvider";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";

// Component
import { CharacterPortrait, GenshinImage } from "@Src/components";
import { EventDisplayer } from "./EventDisplayer";

type SyncState = {
  chunks: SimulationProcessedChunk[];
  sumary: SimulationSumary;
};

export function EventLog(props: { className?: string }) {
  const [{ chunks, sumary }, setState] = useState<SyncState>({
    chunks: [],
    sumary: {
      damage: 0,
      duration: 0,
    },
  });
  const simulation = useActiveSimulation();

  useEffect(() => {
    if (simulation) {
      const { initialChunks, initialSumary, unsubscribe } = simulation.subscribeChunks((chunks, sumary) =>
        setState({ chunks, sumary })
      );

      setState({
        chunks: initialChunks,
        sumary: initialSumary,
      });
      return unsubscribe;
    }
    return undefined;
  }, [simulation]);

  // console.log("render: Timeline");
  // if (chunks.length) console.log([...chunks]);

  if (!simulation) {
    return null;
  }

  return (
    <div className={props.className}>
      {/* <div className="flex">
        <span className="ml-auto px-2 rounded hover:bg-surface-2 cursor-default">
          <span className="text-sm">Total DMG:</span>{" "}
          <span className="text-lg text-secondary-1 font-bold">{sumary.damage}</span>
        </span>
      </div> */}

      <div className="pr-2 h-full flex flex-col custom-scrollbar gap-2">
        {chunks.map((chunk, index) => {
          const chunkOwner = simulation.getMemberData(chunk.ownerCode);

          return (
            <Fragment key={chunk.id}>
              {index ? <div className="h-px bg-surface-border" /> : null}

              <div className="flex gap-2">
                <CharacterPortrait size="custom" className="w-12 h-12 m-0.5" info={chunkOwner} zoomable={false} />

                <div className="overflow-hidden grow flex flex-col">
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
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

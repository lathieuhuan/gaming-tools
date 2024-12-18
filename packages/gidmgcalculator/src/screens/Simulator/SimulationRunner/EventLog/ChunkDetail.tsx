import { useState } from "react";
import { FaCaretDown, FaTrashAlt } from "react-icons/fa";
import { TbLetterS } from "react-icons/tb";
import { Button, ButtonGroup } from "rond";

import { useDispatch } from "@Store/hooks";
import { removeEvent } from "@Store/simulator-slice";
import {
  Performer,
  SimulationManager,
  SimulationProcessedChunk,
  SimulationProcessedEvent,
} from "@Simulator/ToolboxProvider";
import { GenshinImage } from "@Src/components";

interface ChunkDetailProps {
  simulation: SimulationManager;
  chunk: SimulationProcessedChunk;
  event?: SimulationProcessedEvent;
}
export function ChunkDetail({ simulation, chunk, event }: ChunkDetailProps) {
  const dispatch = useDispatch();
  const [showPerformers, setShowPerformers] = useState(false);
  const totalDMG = chunk.events.reduce((total, event) => total + (event.type === "HIT" ? event.damage.value : 0), 0);
  const labelCls = "w-1/2";

  const chunkDetails = [
    {
      label: "On-field",
      value: simulation.members[chunk.ownerCode].data.name,
    },
    {
      label: "Total damage",
      value: totalDMG,
    },
  ];

  if (simulation.timeOn) {
    chunkDetails.push({
      label: "Total duration",
      value: `${chunk.events.reduce((total, event) => total + event.duration, 0) / 100}s`,
    });
  }

  const renderPerformer = (performer: Performer, index: number) => {
    if (performer.type === "SYSTEM") {
      return (
        <div className="w-12 h-12 flex-center bg-surface-3 rounded-circle" title="System">
          <TbLetterS style={{ fontSize: "2.75rem" }} />
        </div>
      );
    }
    return (
      <GenshinImage
        key={index}
        className="w-12 bg-surface-3 rounded-circle overflow-hidden"
        fallbackCls="p-2"
        title={performer.title}
        src={performer.icon}
      />
    );
  };

  const renderEvent = (event: SimulationProcessedEvent) => {
    let eventTypeLabel = "";
    let contentRender: React.JSX.Element | null = null;

    switch (event.type) {
      case "HIT":
        eventTypeLabel = "Hit";
        contentRender = (
          <div>
            <div className="flex">
              <span className={labelCls}>Damage</span>
              <span className={`text-${event.damage.element}`}>{event.damage.value}</span>
            </div>
          </div>
        );
        break;
      case "MODIFY":
        eventTypeLabel = "Modify";
        break;
      case "SYSTEM_MODIFY":
        eventTypeLabel = "Modify";
        break;
    }

    return (
      <div className="mt-3 pt-3 border-t border-surface-border">
        <p className="text-xs text-hint-color">{eventTypeLabel} Event</p>
        <p className="text-lg font-semibold">{event.description}</p>

        <div className="mt-0.5">
          <Button
            className="h-7 gap-1"
            size="custom"
            boneOnly
            icon={<FaCaretDown className={showPerformers ? "rotate-180" : ""} />}
            iconPosition="end"
            onClick={() => setShowPerformers(!showPerformers)}
          >
            Performer
          </Button>
          {showPerformers && <div className="h-12 flex gap-2">{event.performers.map(renderPerformer)}</div>}
        </div>

        {simulation.timeOn && event.duration ? (
          <div className="mt-2 flex">
            <span className={labelCls}>Perform duration</span>
            <span>{event.duration / 100}s</span>
          </div>
        ) : null}
        {contentRender}

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
      </div>
    );
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

      {event ? renderEvent(event) : null}
    </div>
  );
}

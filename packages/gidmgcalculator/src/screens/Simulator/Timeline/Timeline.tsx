import { Fragment, useEffect, useState } from "react";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveMember, changeActiveMember } from "@Store/simulator-slice";
import { ActiveSimulation, SimulationChunk, useActiveSimulation } from "@Simulator/ToolboxProvider";
import { CharacterPortrait } from "@Src/components";

export function Timeline(props: { className?: string }) {
  const [chunks, setChunks] = useState<SimulationChunk[]>([]);
  const simulation = useActiveSimulation();

  useEffect(() => {
    if (simulation) {
      const { initialChunks, unsubscribe } = simulation.subscribeEvents(setChunks);

      setChunks(initialChunks);
      return unsubscribe;
    }
    return undefined;
  }, [simulation]);

  console.log("render: Timeline");
  console.log(chunks);

  if (!simulation) {
    return null;
  }

  return (
    <div className={props.className}>
      <PartyDisplayer
        simulation={simulation}
        onFieldMember={chunks[chunks.length - 1]?.owner.code}
        onChangeOnFieldMember={simulation.switchMember}
      />

      <div className="h-full hide-scrollbar space-y-2">
        {chunks.map((chunk, index) => {
          return (
            <Fragment key={chunk.id}>
              {index ? <div className="h-px bg-surface-border" /> : null}

              <div className="flex gap-2">
                <div>{chunk.owner.name}</div>
                <div>
                  {chunk.events.map((event) => {
                    return (
                      <div key={event.id}>
                        {event.type} {event.performer.code}
                      </div>
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

interface PartyDisplayerProps {
  onFieldMember?: number;
  simulation: ActiveSimulation;
  onChangeOnFieldMember?: (code: number) => void;
}
function PartyDisplayer(props: PartyDisplayerProps) {
  const dispatch = useDispatch();
  const activeMemberName = useSelector(selectActiveMember);

  const onClickMember = (name: string) => {
    dispatch(changeActiveMember(name));
  };

  return (
    <div className="flex gap-4">
      {props.simulation.partyData.map((data) => {
        return (
          <div key={data.code}>
            <div title={data.name} onClick={() => onClickMember(data.name)}>
              <CharacterPortrait withColorBg={data.name === activeMemberName} info={data} />
            </div>
            {data.code === props.onFieldMember ? <p>onField</p> : null}
          </div>
        );
      })}
    </div>
  );
}

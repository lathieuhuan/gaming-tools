import { Fragment, useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Button } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveMember, changeActiveMember } from "@Store/simulator-slice";
import { ActiveSimulation, SimulationChunk, useActiveSimulation } from "@Simulator/ToolboxProvider";
import { CharacterPortrait, GenshinImage } from "@Src/components";

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
  if (chunks.length) console.log(chunks);

  if (!simulation) {
    return null;
  }

  return (
    <div className={props.className}>
      <PartyDisplayer
        simulation={simulation}
        onFieldCode={chunks[0]?.ownerCode}
        onChangeOnFieldMember={simulation.switchMember}
      />

      <div className="mt-4 h-full hide-scrollbar space-y-2">
        {chunks.map((chunk, index) => {
          const chunkOwner = simulation.getMemberData(chunk.ownerCode);

          return (
            <Fragment key={chunk.id}>
              {index ? <div className="h-px bg-surface-border" /> : null}

              <div className="flex gap-2">
                <CharacterPortrait size="custorm" className="w-12 h-12" info={chunkOwner} />

                <div className="grow space-y-2">
                  {chunk.events.map((event) => {
                    const performer = simulation.getMemberData(event.performer.code);

                    return (
                      <div key={event.id} className="p-2 rounded flex items-center bg-surface-2">
                        <div className="w-7 h-7 mr-2">
                          <GenshinImage src={performer.sideIcon} />
                        </div>
                        <span className="capitalize">{event.type.toLowerCase()}</span>
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
  onFieldCode?: number;
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
            <CharacterPortrait
              size="small"
              withColorBg={data.name === activeMemberName}
              info={data}
              onClick={() => onClickMember(data.name)}
            />

            <div className="mt-3 flex-center">
              <Button
                size="small"
                icon={<FaSyncAlt />}
                disabled={data.code === props.onFieldCode}
                onClick={() => props.onChangeOnFieldMember?.(data.code)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

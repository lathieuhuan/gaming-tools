import { Fragment, useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Button, clsx } from "rond";

import type { SimulationPartyData } from "@Src/types";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveMember, changeActiveMember, changeOnFieldMember } from "@Store/simulator-slice";
import {
  ActiveSimulation,
  SimulationChunksSumary,
  SimulationProcessedChunk,
  useActiveSimulation,
} from "@Simulator/ToolboxProvider";

// Component
import { CharacterPortrait, GenshinImage } from "@Src/components";
import { EventDisplayer } from "./EventDisplayer";

type SyncState = {
  chunks: SimulationProcessedChunk[];
  sumary: SimulationChunksSumary;
};

export function Timeline(props: { className?: string }) {
  const dispatch = useDispatch();
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
  // if (chunks.length) console.log(chunks);

  if (!simulation) {
    return null;
  }

  return (
    <div className={clsx("h-full flex flex-col gap-4", props.className)} style={{ width: "22rem" }}>
      <PartyDisplayer
        simulation={simulation}
        onFieldCode={chunks[0]?.ownerCode}
        onChangeOnFieldMember={(code) => {
          dispatch(changeOnFieldMember(code));
        }}
      />

      <div className="flex">
        <span className="ml-auto px-2 rounded-sm hover:bg-surface-2 cursor-default">
          Total DMG: <span className="text-lg text-secondary-1 font-bold">{sumary.damage}</span>
        </span>
      </div>

      <div className="grow hide-scrollbar space-y-2">
        {chunks.map((chunk, index) => {
          const chunkOwner = simulation.getMemberData(chunk.ownerCode);

          return (
            <Fragment key={chunk.id}>
              {index ? <div className="h-px bg-surface-border" /> : null}

              <div className="flex gap-2">
                <CharacterPortrait size="custorm" className="w-12 h-12 m-0.5" info={chunkOwner} zoomable={false} />

                <div className="overflow-hidden grow">
                  {chunk.events.map((event) => {
                    return (
                      <EventDisplayer
                        key={event.id}
                        sideIconNode={
                          <GenshinImage
                            className="w-7 h-7 shrink-0 relative"
                            imgCls="absolute"
                            imgStyle={{
                              maxWidth: "none",
                              width: "130%",
                              top: "-9px",
                              left: "-6px",
                            }}
                            src={simulation.getMemberData(event.performer.code)?.sideIcon}
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

interface PartyDisplayerProps {
  onFieldCode?: number;
  simulation: ActiveSimulation;
  onChangeOnFieldMember: (code: number) => void;
}
function PartyDisplayer(props: PartyDisplayerProps) {
  const dispatch = useDispatch();
  const activeMemberName = useSelector(selectActiveMember);

  const onClickMember = (name: string) => {
    dispatch(changeActiveMember(name));
  };

  const onChangeOnFieldMember = (data: SimulationPartyData[number]) => {
    props.onChangeOnFieldMember(data.code);
    onClickMember(data.name);
  };

  return (
    <div className="flex justify-center gap-4">
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
                onClick={() => onChangeOnFieldMember(data)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

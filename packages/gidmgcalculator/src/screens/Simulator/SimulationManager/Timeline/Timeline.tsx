import { Fragment, useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Button, clsx } from "rond";

import type { SimulationPartyData } from "@Src/types";
import type { SimulationManager, SimulationProcessedChunk, SimulationSumary } from "@Simulator/simulation-control";

import { useDispatch, useSelector } from "@Store/hooks";
import {
  changeActiveMember,
  changeOnFieldMember,
  selectActiveMember,
  selectOnFieldMember,
} from "@Store/simulator-slice";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";

// Component
import { CharacterPortrait, GenshinImage } from "@Src/components";
import { EventDisplayer } from "./EventDisplayer";

type SyncState = {
  chunks: SimulationProcessedChunk[];
  sumary: SimulationSumary;
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
  // if (chunks.length) console.log([...chunks]);

  if (!simulation) {
    return null;
  }

  return (
    <div className={clsx("h-full flex flex-col gap-4", props.className)} style={{ width: "22rem" }}>
      <PartyDisplayer
        simulation={simulation}
        onChangeOnFieldMember={(code) => {
          dispatch(changeOnFieldMember(code));
        }}
      />

      <div className="flex">
        <span className="ml-auto px-2 rounded hover:bg-surface-2 cursor-default">
          <span className="text-sm">Total DMG:</span>{" "}
          <span className="text-lg text-secondary-1 font-bold">{sumary.damage}</span>
        </span>
      </div>

      <div className="grow hide-scrollbar">
        <div className="flex flex-col-reverse gap-2">
          {chunks.map((chunk, index) => {
            const chunkOwner = simulation.getMemberData(chunk.ownerCode);

            return (
              <Fragment key={chunk.id}>
                {index ? <div className="h-px bg-surface-border" /> : null}

                <div className="flex gap-2">
                  <CharacterPortrait size="custorm" className="w-12 h-12 m-0.5" info={chunkOwner} zoomable={false} />

                  <div className="overflow-hidden grow flex flex-col-reverse">
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
    </div>
  );
}

interface PartyDisplayerProps {
  simulation: SimulationManager;
  onChangeOnFieldMember: (code: number) => void;
}
function PartyDisplayer(props: PartyDisplayerProps) {
  const dispatch = useDispatch();
  const activeMemberCode = useSelector(selectActiveMember);
  const onFieldMember = useSelector(selectOnFieldMember);

  const onClickMember = (code: number) => {
    dispatch(changeActiveMember(code));
  };

  const onChangeOnFieldMember = (data: SimulationPartyData[number]) => {
    props.onChangeOnFieldMember(data.code);
    onClickMember(data.code);
  };

  return (
    <div className="flex justify-center gap-4">
      {props.simulation.partyData.map((data) => {
        return (
          <div key={data.code}>
            <CharacterPortrait
              size="small"
              withColorBg={data.code === activeMemberCode}
              info={data}
              onClick={() => onClickMember(data.code)}
            />

            {data.code !== onFieldMember ? (
              <div className="mt-3 flex-center">
                <Button size="small" icon={<FaSyncAlt />} onClick={() => onChangeOnFieldMember(data)} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveChunk, updateSimulator } from "@Store/simulator-slice";

export function useTimelineTracker() {
  const dispatch = useDispatch();
  const selectedChunkId = useSelector(selectActiveChunk);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.querySelector(`div[data-id="${selectedChunkId}"]`)?.scrollIntoView();
  }, [selectedChunkId]);

  const getChunkProps = (id: string) => {
    return {
      "data-id": id,
      onClick: () => dispatch(updateSimulator({ activeChunkId: id })),
    };
  };

  return {
    selectedChunkId,
    timelineRef: logRef,
    dispatch,
    getChunkProps,
  };
}

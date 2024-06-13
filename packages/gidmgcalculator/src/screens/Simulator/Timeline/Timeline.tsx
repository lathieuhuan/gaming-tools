import { useSelector } from "@Store/hooks";
import { getSimulation } from "@Store/simulator-slice";
import { RootState } from "@Store/store";

const selectEvents = (state: RootState) => getSimulation(state.simulator)?.events ?? [];

export function Timeline(props: { className?: string }) {
  const events = useSelector(selectEvents);

  console.log("render: Timeline");
  console.log(events);

  return <></>;
}

import { useDispatch, useSelector } from "@Store/hooks";
import { getSimulation, selectActiveMember, switchMember } from "@Store/simulator-slice";
import { RootState } from "@Store/store";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";
import { CharacterPortrait } from "@Src/components";

const selectEvents = (state: RootState) => getSimulation(state.simulator)?.events ?? [];

export function Timeline(props: { className?: string }) {
  const events = useSelector(selectEvents);

  return (
    <div className={props.className}>
      <PartyDisplayer />
      <div className="h-full hide-scrollbar space-y-3">
        {events.map((event) => {
          return (
            <div key={event.id}>
              <div>{event.performer}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PartyDisplayer() {
  const dispatch = useDispatch();
  const activeMemberName = useSelector(selectActiveMember);
  const simulation = useActiveSimulation();

  const onClickMember = (name: string) => {
    dispatch(switchMember(name));
  };

  return (
    <div className="flex gap-4">
      {simulation?.partyData.map((data) => {
        return (
          <div key={data.code} title={data.name} onClick={() => onClickMember(data.name)}>
            <CharacterPortrait withColorBg={data.name === activeMemberName} info={data} />
          </div>
        );
      })}
    </div>
  );
}

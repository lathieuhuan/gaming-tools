import { CharacterPortrait } from "@Src/components";
import { useStoreSnapshot } from "@Src/features";
import { useDispatch, useSelector } from "@Store/hooks";
import { getSimulation, selectActiveMember, updateSimulator } from "@Store/simulator-slice";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";

export function MemberPortraits() {
  const dispatch = useDispatch();
  const simulationName = useStoreSnapshot((state) => getSimulation(state.simulator)?.name);
  const simulation = useActiveSimulation();
  const activeMemberCode = useSelector(selectActiveMember);

  const onClickMember = (code: number) => {
    dispatch(updateSimulator({ activeMember: code }));
  };

  return (
    <div className="flex items-center">
      <span>{simulationName}</span>

      <div className="ml-4 flex gap-3">
        {simulation?.partyData.map((data) => {
          return (
            <div key={data.code}>
              <CharacterPortrait
                className="w-10 h-10"
                size="custom"
                withColorBg={data.code === activeMemberCode}
                info={data}
                onClick={() => onClickMember(data.code)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

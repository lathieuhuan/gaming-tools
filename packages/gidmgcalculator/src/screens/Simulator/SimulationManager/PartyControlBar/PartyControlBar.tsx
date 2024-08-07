import { CharacterPortrait } from "@Src/components";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveMember, updateSimulator } from "@Store/simulator-slice";
import { useActiveSimulation } from "@Simulator/ToolboxProvider";

export function PartyControlBar(props: { className?: string }) {
  const dispatch = useDispatch();
  const simulation = useActiveSimulation();
  const activeMemberCode = useSelector(selectActiveMember);

  const onClickMember = (code: number) => {
    dispatch(updateSimulator({ activeMember: code }));
  };

  return (
    <div className={props.className}>
      <div className="space-y-4">
        {simulation?.partyData.map((data) => {
          return (
            <div key={data.code} className="flex justify-end gap-2 cursor-default">
              <span className="font-semibold">{data.name}</span>
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

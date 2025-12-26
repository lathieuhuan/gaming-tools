import { TalentList } from "@/components";
import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { useActiveChar } from "../ActiveCharProvider";

interface PanelTalentsProps {
  className?: string;
}
export function PanelTalents(props: PanelTalentsProps) {
  const dispatch = useDispatch();
  const character = useActiveChar();

  return (
    <TalentList
      className={props.className}
      character={character}
      onChangeTalentLevel={(type, level) => {
        dispatch(
          updateUserCharacter({
            name: character.name,
            [type]: level,
          })
        );
      }}
    />
  );
}

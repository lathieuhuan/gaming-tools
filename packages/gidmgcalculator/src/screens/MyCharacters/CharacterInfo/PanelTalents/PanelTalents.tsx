import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { TalentList } from "@Src/components";
import { useCharacterInfo } from "../CharacterInfoProvider";

interface PanelTalentsProps {
  className?: string;
}
export function PanelTalents(props: PanelTalentsProps) {
  const dispatch = useDispatch();
  const { loading, data } = useCharacterInfo();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!data) return null;
  const { char } = data;

  return (
    <TalentList
      className={props.className}
      char={char}
      onChangeTalentLevel={(type, level) => {
        dispatch(updateUserCharacter({ name: char.name, [type]: level }));
      }}
    />
  );
}

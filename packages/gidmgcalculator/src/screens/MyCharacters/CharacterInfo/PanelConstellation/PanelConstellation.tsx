import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { ConstellationList } from "@Src/components";
import { useCharacterInfo } from "../CharacterInfoProvider";

interface PanelConstellationProps {
  className?: string;
}
export function PanelConstellation(props: PanelConstellationProps) {
  const dispatch = useDispatch();
  const { loading, data } = useCharacterInfo();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!data) return null;
  const { char } = data;

  return (
    <ConstellationList
      className={props.className}
      char={char}
      onClickIcon={(i) => {
        dispatch(
          updateUserCharacter({
            name: char.name,
            cons: char.cons === i + 1 ? i : i + 1,
          })
        );
      }}
    />
  );
}

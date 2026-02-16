import { ConstellationList } from "@/components";
import { useDispatch } from "@Store/hooks";
import { updateDbCharacter } from "@Store/userdb-slice";
import { useActiveChar } from "../ActiveCharProvider";

type PanelConstellationProps = {
  className?: string;
};

export function PanelConstellation(props: PanelConstellationProps) {
  const dispatch = useDispatch();
  const character = useActiveChar();

  return (
    <ConstellationList
      className={props.className}
      character={character}
      onClickIcon={(i) => {
        dispatch(
          updateDbCharacter({
            code: character.code,
            cons: character.cons === i + 1 ? i : i + 1,
          })
        );
      }}
    />
  );
}

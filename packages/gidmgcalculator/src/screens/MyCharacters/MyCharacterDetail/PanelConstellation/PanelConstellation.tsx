import { LoadingSpin } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { ConstellationList } from "@Src/components";
import { useMyCharacterDetailInfo } from "../MyCharacterDetailInfoProvider";

interface PanelConstellationProps {
  className?: string;
}
export function PanelConstellation(props: PanelConstellationProps) {
  const dispatch = useDispatch();
  const { loading, data } = useMyCharacterDetailInfo();

  if (loading) {
    return (
      <div className="h-full flex-center">
        <LoadingSpin size="large" />
      </div>
    );
  }
  if (!data) return null;
  const { character } = data;

  return (
    <ConstellationList
      className={props.className}
      character={character}
      onClickIcon={(i) => {
        dispatch(
          updateUserCharacter({
            name: character.name,
            cons: character.cons === i + 1 ? i : i + 1,
          })
        );
      }}
    />
  );
}

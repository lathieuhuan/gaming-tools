import { useDispatch } from "@Store/hooks";
import { updateDbCharacter } from "@Store/userdbSlice";
import { useActiveChar } from "./ActiveCharProvider";

import { TalentList } from "@/components";

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
          updateDbCharacter({
            code: character.code,
            [type]: level,
          })
        );
      }}
    />
  );
}

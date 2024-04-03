import { LoadingSpin } from "rond";

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
    return (
      <div className="h-full flex-center">
        <LoadingSpin size="large" />
      </div>
    );
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

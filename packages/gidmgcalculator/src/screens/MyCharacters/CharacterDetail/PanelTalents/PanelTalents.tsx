import { LoadingSpin } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { TalentList } from "@Src/components";
import { useDetailInfo } from "../ContextProvider";

interface PanelTalentsProps {
  className?: string;
}
export function PanelTalents(props: PanelTalentsProps) {
  const dispatch = useDispatch();
  const data = useDetailInfo();

  if (!data) {
    return (
      <div className="h-full flex-center">
        <LoadingSpin size="large" />
      </div>
    );
  }

  return (
    <TalentList
      className={props.className}
      character={data.character}
      record={data.characterRecord}
      onChangeTalentLevel={(type, level) => {
        dispatch(updateUserCharacter({ name: data.character.name, [type]: level }));
      }}
    />
  );
}

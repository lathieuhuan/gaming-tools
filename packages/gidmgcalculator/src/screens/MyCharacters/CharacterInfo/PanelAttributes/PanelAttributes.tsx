import { AttributeTable, CharacterIntro } from "@Src/components";
import { clsx } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { useCharacterInfo } from "../CharacterInfoProvider";
import { useCharacterInfoModalCtrl } from "../CharacterInfoModalsProvider";

interface PanelAttributesProps {
  className?: string;
}
export function PanelAttributes(props: PanelAttributesProps) {
  const dispatch = useDispatch();
  const { loading, data } = useCharacterInfo();
  const modalCtrl = useCharacterInfoModalCtrl();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!data) return null;

  const { char, totalAttr } = data;

  return (
    <div className={clsx("h-full flex flex-col gap-3", props.className)}>
      <CharacterIntro
        char={char}
        appChar={data.appChar}
        switchable
        removable
        mutable
        onSwitch={modalCtrl.requestSwitchCharacter}
        onRemove={modalCtrl.requestRemoveCharacter}
        onChangeLevel={(level) => dispatch(updateUserCharacter({ name: char.name, level }))}
        onChangeCons={(cons) => dispatch(updateUserCharacter({ name: char.name, cons }))}
      />

      <div className="mt-1 grow custom-scrollbar">
        <AttributeTable attributes={totalAttr} />
      </div>
    </div>
  );
}

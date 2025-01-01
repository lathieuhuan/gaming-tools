import { AttributeTable, CharacterIntro } from "@Src/components";
import { LoadingSpin, clsx } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { useDetailInfo, useDetailModalCtrl } from "../ContextProvider";

interface PanelAttributesProps {
  className?: string;
}
export function PanelAttributes(props: PanelAttributesProps) {
  const dispatch = useDispatch();
  const data = useDetailInfo();
  const modalCtrl = useDetailModalCtrl();

  if (!data) {
    return (
      <div className="h-full flex-center">
        <LoadingSpin size="large" />
      </div>
    );
  }

  const { character, totalAttr } = data;

  return (
    <div className={clsx("h-full flex flex-col gap-3", props.className)}>
      <CharacterIntro
        character={character}
        appCharacter={data.characterRecord.appCharacter}
        switchable
        removable
        mutable
        onSwitch={modalCtrl.requestSwitchCharacter}
        onRemove={modalCtrl.requestRemoveCharacter}
        onChangeLevel={(level) => dispatch(updateUserCharacter({ name: character.name, level }))}
        onChangeCons={(cons) => dispatch(updateUserCharacter({ name: character.name, cons }))}
      />

      <div className="mt-1 grow custom-scrollbar">
        <AttributeTable attributes={totalAttr} />
      </div>
    </div>
  );
}

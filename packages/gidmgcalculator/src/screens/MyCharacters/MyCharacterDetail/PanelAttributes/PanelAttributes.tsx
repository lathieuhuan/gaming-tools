import { AttributeTable, CharacterIntro } from "@Src/components";
import { LoadingSpin, clsx } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { useMyCharacterDetailInfo } from "../MyCharacterDetailInfoProvider";
import { useMyCharacterDetailModalsCtrl } from "../MyCharacterDetailModalsProvider";

interface PanelAttributesProps {
  className?: string;
}
export function PanelAttributes(props: PanelAttributesProps) {
  const dispatch = useDispatch();
  const { loading, data } = useMyCharacterDetailInfo();
  const modalCtrl = useMyCharacterDetailModalsCtrl();

  if (loading) {
    return (
      <div className="h-full flex-center">
        <LoadingSpin size="large" />
      </div>
    );
  }
  if (!data) return null;

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

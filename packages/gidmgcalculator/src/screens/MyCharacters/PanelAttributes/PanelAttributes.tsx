import { LoadingSpin, clsx } from "rond";

import { AttributeTable, CharacterIntro } from "@/components";
import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";
import { useActiveChar, useActiveCharActions } from "../ActiveCharProvider";

type PanelAttributesProps = {
  className?: string;
};

export function PanelAttributes(props: PanelAttributesProps) {
  const dispatch = useDispatch();
  const character = useActiveChar();
  const actions = useActiveCharActions();

  return (
    <div className={clsx("h-full flex flex-col gap-3", props.className)}>
      <CharacterIntro
        character={character}
        switchable
        removable
        mutable
        onSwitch={actions.requestSwitchCharacter}
        onRemove={actions.requestRemoveCharacter}
        onChangeLevel={(level) => dispatch(updateUserCharacter({ name: character.name, level }))}
        onChangeCons={(cons) => dispatch(updateUserCharacter({ name: character.name, cons }))}
      />

      <div className="mt-1 grow custom-scrollbar">
        <AttributeTable attributes={character.totalAttrs} />
      </div>
    </div>
  );
}

import { clsx } from "rond";

import { AttributeTable, CharacterIntro } from "@/components";
import { useDispatch } from "@Store/hooks";
import { updateDbCharacter } from "@Store/userdbSlice";
import { useActiveChar, useActiveCharActions } from "./ActiveCharProvider";

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
        onChangeLevel={(level) => dispatch(updateDbCharacter({ code: character.code, level }))}
        onChangeCons={(cons) => dispatch(updateDbCharacter({ code: character.code, cons }))}
        onEnhanceToggle={(enhanced) =>
          dispatch(updateDbCharacter({ code: character.code, enhanced }))
        }
      />

      <div className="mt-1 grow custom-scrollbar">
        <AttributeTable attributes={character.allAttrsCtrl.finals} />
      </div>
    </div>
  );
}

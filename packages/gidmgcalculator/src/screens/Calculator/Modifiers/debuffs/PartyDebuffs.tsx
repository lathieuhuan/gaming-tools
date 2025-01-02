import type { Party } from "@Src/types";
import { useDispatch } from "@Store/hooks";
import {
  changeTeammateModCtrlInput,
  toggleTeammateModCtrl,
  type ToggleTeammateModCtrlPath,
} from "@Store/calculator-slice";
import { PartyDebuffsView } from "@Src/components";
import { useCharacterData } from "../../ContextProvider";

interface PartyDebuffsProps {
  party: Party;
}
export default function PartyDebuffs(props: PartyDebuffsProps) {
  const dispatch = useDispatch();
  const characterData = useCharacterData();

  return (
    <PartyDebuffsView
      mutable
      {...props}
      characterData={characterData}
      getHanlders={({ ctrl, teammateIndex }) => {
        const path: ToggleTeammateModCtrlPath = {
          teammateIndex,
          modCtrlName: "debuffCtrls",
          ctrlIndex: ctrl.index,
        };

        const updateDebuffCtrlInput = (value: number, inputIndex: number) => {
          dispatch(changeTeammateModCtrlInput(Object.assign({ value, inputIndex }, path)));
        };

        return {
          onToggle: () => {
            dispatch(toggleTeammateModCtrl(path));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateDebuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateDebuffCtrlInput,
          onSelectOption: updateDebuffCtrlInput,
        };
      }}
    />
  );
}

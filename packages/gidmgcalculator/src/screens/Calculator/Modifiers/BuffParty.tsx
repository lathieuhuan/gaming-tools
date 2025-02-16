import type { Party } from "@Src/types";
import {
  changeTeammateModCtrlInput,
  toggleTeammateModCtrl,
  type ToggleTeammateModCtrlPath,
} from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";
import { PartyBuffsView } from "@Src/components";
import { useCharacterData } from "../ContextProvider";

interface BuffPartyProps {
  party: Party;
}
export default function BuffParty(props: BuffPartyProps) {
  const dispatch = useDispatch();
  const characterData = useCharacterData();

  return (
    <PartyBuffsView
      mutable
      {...props}
      characterData={characterData}
      getHanlders={({ ctrl, teammateIndex }) => {
        const path: ToggleTeammateModCtrlPath = {
          teammateIndex,
          modCtrlName: "buffCtrls",
          ctrlIndex: ctrl.index,
        };

        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          dispatch(changeTeammateModCtrlInput(Object.assign({ value, inputIndex }, path)));
        };

        return {
          onToggle: () => {
            dispatch(toggleTeammateModCtrl(path));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateBuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateBuffCtrlInput,
          onSelectOption: updateBuffCtrlInput,
        };
      }}
    />
  );
}

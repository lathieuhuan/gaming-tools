import type { Party, PartyData } from "@Src/types";
import {
  changeTeammateModCtrlInput,
  selectCharacter,
  toggleTeammateModCtrl,
  type ToggleTeammateModCtrlPath,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { PartyBuffsView } from "@Src/components";

interface PartyBuffsProps {
  party: Party;
  partyData: PartyData;
}
export default function PartyBuffs(props: PartyBuffsProps) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);

  return (
    <PartyBuffsView
      mutable
      {...props}
      char={char}
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

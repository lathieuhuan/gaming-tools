import type { Party, CalcAppParty } from "@Src/types";
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectCharacter,
  changeTeammateModCtrlInput,
  toggleTeammateModCtrl,
  type ToggleTeammateModCtrlPath,
} from "@Store/calculator-slice";
import { PartyDebuffsView } from "@Src/components";

interface PartyDebuffsProps {
  party: Party;
  partyData: CalcAppParty;
}
export default function PartyDebuffs(props: PartyDebuffsProps) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);

  return (
    <PartyDebuffsView
      mutable
      {...props}
      char={char}
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

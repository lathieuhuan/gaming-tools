import type { PartyData } from "@Src/types";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectCharacter, changeModCtrlInput, toggleModCtrl, type ToggleModCtrlPath } from "@Store/calculator-slice";
import { SelfBuffsView } from "@Src/components";
import { useCharacterData } from "../../contexts";

export default function SelfBuffs({ partyData }: { partyData: PartyData }) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const selfBuffCtrls = useSelector((state) => state.calculator.setupsById[state.calculator.activeId].selfBuffCtrls);
  const appChar = useCharacterData();

  return (
    <SelfBuffsView
      mutable
      {...{ appChar, char, partyData }}
      modCtrls={selfBuffCtrls}
      getHanlders={({ ctrl }) => {
        const path: ToggleModCtrlPath = {
          modCtrlName: "selfBuffCtrls",
          ctrlIndex: ctrl.index,
        };

        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          dispatch(changeModCtrlInput(Object.assign({ value, inputIndex }, path)));
        };

        return {
          onToggle: () => {
            dispatch(toggleModCtrl(path));
          },
          onToggleCheck: (currentinput, inputIndex) => {
            updateBuffCtrlInput(currentinput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateBuffCtrlInput,
          onSelectOption: updateBuffCtrlInput,
        };
      }}
    />
  );
}

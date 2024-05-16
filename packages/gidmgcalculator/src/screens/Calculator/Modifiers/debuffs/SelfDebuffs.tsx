import type { PartyData } from "@Src/types";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectCharacter, changeModCtrlInput, toggleModCtrl, type ToggleModCtrlPath } from "@Store/calculator-slice";
import { SelfDebuffsView } from "@Src/components";
import { useCalcAppCharacter } from "../../CalculatorInfoProvider";

export default function SelfDebuffs({ partyData }: { partyData: PartyData }) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const selfDebuffCtrls = useSelector(
    (state) => state.calculator.setupsById[state.calculator.activeId].selfDebuffCtrls
  );
  const appChar = useCalcAppCharacter();

  return (
    <SelfDebuffsView
      mutable
      {...{ char, appChar, partyData }}
      modCtrls={selfDebuffCtrls}
      getHanlders={({ ctrl }) => {
        const path: ToggleModCtrlPath = {
          modCtrlName: "selfDebuffCtrls",
          ctrlIndex: ctrl.index,
        };

        const updateDebuffCtrlInput = (value: number, inputIndex: number) => {
          dispatch(changeModCtrlInput(Object.assign({ value, inputIndex }, path)));
        };

        return {
          onToggle: () => {
            dispatch(toggleModCtrl(path));
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

import {
  changeModCtrlInput,
  selectCharacter,
  toggleModCtrl,
  type ToggleModCtrlPath,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { useCalcTeamData } from "../ContextProvider";

import { SelfBuffsView } from "@/components";

export default function BuffSelf() {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  const selfBuffCtrls = useSelector(
    (state) => state.calculator.setupsById[state.calculator.activeId].selfBuffCtrls
  );
  const teamData = useCalcTeamData();

  return (
    <SelfBuffsView
      mutable
      character={character}
      teamData={teamData}
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

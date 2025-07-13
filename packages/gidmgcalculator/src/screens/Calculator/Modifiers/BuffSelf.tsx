import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectCharacter,
  changeModCtrlInput,
  toggleModCtrl,
  type ToggleModCtrlPath,
  selectTeammates,
} from "@Store/calculator-slice";
import { useTeamData } from "../ContextProvider";

import { SelfBuffsView } from "@Src/components";
import { CalcTeamData } from "@Calculation";
import { useMemo } from "react";

export default function BuffSelf() {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  const selfBuffCtrls = useSelector((state) => state.calculator.setupsById[state.calculator.activeId].selfBuffCtrls);
  const teammates = useSelector(selectTeammates);
  const teamData = useTeamData();

  const calcTeamData = useMemo(() => {
    return new CalcTeamData(character, teammates, teamData.data);
  }, [character, teammates, teamData]);

  return (
    <SelfBuffsView
      mutable
      character={character}
      teamData={calcTeamData}
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

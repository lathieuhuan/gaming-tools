import type { Teammates } from "@/types";
import { useDispatch } from "@Store/hooks";
import {
  changeTeammateModCtrlInput,
  toggleTeammateModCtrl,
  type ToggleTeammateModCtrlPath,
} from "@Store/calculator-slice";
import { TeammateDebuffsView } from "@/components";
import { useCalcTeamData } from "../ContextProvider";

export default function DebuffTeammates(props: { teammates: Teammates }) {
  const dispatch = useDispatch();
  const teamData = useCalcTeamData();

  return (
    <TeammateDebuffsView
      mutable
      teamData={teamData}
      teammates={props.teammates}
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

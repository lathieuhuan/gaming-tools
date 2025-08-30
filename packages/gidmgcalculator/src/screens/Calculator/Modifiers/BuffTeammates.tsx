import type { Teammates } from "@/types";
import {
  changeTeammateModCtrlInput,
  toggleTeammateModCtrl,
  type ToggleTeammateModCtrlPath,
} from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";
import { TeammateBuffsView } from "@/components";
import { useCalcTeamData } from "../ContextProvider";

interface BuffTeammatesProps {
  teammates: Teammates;
}
export default function BuffTeammates(props: BuffTeammatesProps) {
  const dispatch = useDispatch();
  const teamData = useCalcTeamData();

  return (
    <TeammateBuffsView
      mutable
      teammates={props.teammates}
      teamData={teamData}
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

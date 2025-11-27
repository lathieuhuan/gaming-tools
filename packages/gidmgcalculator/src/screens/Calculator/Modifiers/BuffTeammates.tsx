import { useCalcStore } from "@Store/calculator";
import {
  toggleTeammateModCtrl,
  ToggleTeammateModCtrlPath,
  updateTeammateModCtrlInput,
} from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";

import { TeammateBuffsView } from "@/components";

export default function BuffTeammates() {
  const teammates = useCalcStore((state) => selectSetup(state).teammates);

  return (
    <TeammateBuffsView
      mutable
      teammates={teammates}
      getHanlders={(teammate, ctrl) => {
        const path: ToggleTeammateModCtrlPath = {
          teammateCode: teammate.data.code,
          modCtrlName: "buffCtrls",
          ctrlId: ctrl.id,
        };

        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          updateTeammateModCtrlInput(path, inputIndex, value);
        };

        return {
          onToggle: () => {
            toggleTeammateModCtrl(path);
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

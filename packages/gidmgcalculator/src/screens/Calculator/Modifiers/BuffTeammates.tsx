import type { CalcTeammate } from "@/models/calculator";
import type { IAbilityBuffCtrl } from "@/types";

import { useCalcStore } from "@Store/calculator";
import { updateTeammate } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { TeammateBuffsView } from "@/components";

export default function BuffTeammates() {
  const teammates = useCalcStore((state) => selectSetup(state).teammates);

  const handleUpdateCtrls = (teammate: CalcTeammate, ctrls: IAbilityBuffCtrl[]) => {
    updateTeammate(teammate.data.code, {
      buffCtrls: ctrls,
    });
  };

  return (
    <TeammateBuffsView
      mutable
      teammates={teammates}
      getHanlders={(teammate, ctrl) => {
        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateCtrls(
            teammate,
            updateModCtrlInputs(teammate.buffCtrls, ctrl.id, inputIndex, value)
          );
        };

        return {
          onToggle: () => {
            handleUpdateCtrls(teammate, toggleModCtrl(teammate.buffCtrls, ctrl.id));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateCtrlInput,
          onSelectOption: updateCtrlInput,
        };
      }}
    />
  );
}

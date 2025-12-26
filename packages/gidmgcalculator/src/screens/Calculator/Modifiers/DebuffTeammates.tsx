import type { CalcTeammate } from "@/models/calculator";
import type { IAbilityDebuffCtrl } from "@/types";

import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { updateTeammate } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { TeammateDebuffsView } from "@/components";

export default function DebuffTeammates() {
  const { teammates, team } = useShallowCalcStore((state) =>
    Object_.pickProps(selectSetup(state), ["teammates", "team"])
  );

  const handleUpdateCtrls = (teammate: CalcTeammate, ctrls: IAbilityDebuffCtrl[]) => {
    updateTeammate(teammate.data.code, {
      debuffCtrls: ctrls,
    });
  };

  return (
    <TeammateDebuffsView
      mutable
      teammates={teammates}
      team={team}
      getHanlders={(teammate, ctrl) => {
        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateCtrls(
            teammate,
            updateModCtrlInputs(teammate.debuffCtrls, ctrl.id, inputIndex, value)
          );
        };

        return {
          onToggle: () => {
            handleUpdateCtrls(teammate, toggleModCtrl(teammate.debuffCtrls, ctrl.id));
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

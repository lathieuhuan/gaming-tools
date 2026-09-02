import { Object_ } from "ron-utils";

import type { Teammate } from "@/models";
import type { AbilityBuffCtrl } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { TeammateBuffsView } from "@/components/ModifierLists";

export default function BuffTeammates() {
  const { teammates, team } = useShallowCalcStore((state) =>
    Object_.extract(selectSetup(state), ["teammates", "team"]),
  );

  const handleUpdateCtrls = (teammate: Teammate, ctrls: AbilityBuffCtrl[]) => {
    updateSetup((setup) => {
      setup.updateTeammateModCtrls(teammate.data.code, {
        buffCtrls: ctrls,
      });
    });
  };

  return (
    <TeammateBuffsView
      mutable
      teammates={teammates}
      team={team}
      getHanlders={(teammate, ctrl) => {
        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateCtrls(
            teammate,
            updateModCtrlInputs(teammate.buffCtrls, ctrl.id, inputIndex, value),
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

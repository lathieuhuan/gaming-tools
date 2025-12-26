import type { IAbilityBuffCtrl } from "@/types";

import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { SelfBuffsView } from "@/components";

export default function BuffSelf() {
  const { main, team, selfBuffCtrls } = useShallowCalcStore((state) =>
    Object_.pickProps(selectSetup(state), ["main", "team", "selfBuffCtrls"])
  );

  const handleUpdateCtrls = (newCtrls: IAbilityBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.selfBuffCtrls = newCtrls;
    });
  };

  return (
    <SelfBuffsView
      mutable
      character={main}
      team={team}
      modCtrls={selfBuffCtrls}
      getHanlders={(ctrl) => {
        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateCtrls(updateModCtrlInputs(selfBuffCtrls, ctrl.id, inputIndex, value));
        };

        return {
          onToggle: () => {
            handleUpdateCtrls(toggleModCtrl(selfBuffCtrls, ctrl.id));
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

import type { IAbilityBuffCtrl } from "@/types";

import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { SelfBuffsView } from "@/components";

export default function BuffSelf() {
  const { char: character, selfBuffCtrls } = useShallowCalcStore((state) =>
    Object_.pickProps(selectSetup(state), ["char", "selfBuffCtrls"])
  );

  const handleUpdateBuffCtrls = (newCtrls: IAbilityBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.selfBuffCtrls = newCtrls;
    });
  };

  return (
    <SelfBuffsView
      mutable
      character={character}
      modCtrls={selfBuffCtrls}
      getHanlders={(ctrl) => {
        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateBuffCtrls(updateModCtrlInputs(selfBuffCtrls, ctrl.id, inputIndex, value));
        };

        return {
          onToggle: () => {
            handleUpdateBuffCtrls(toggleModCtrl(selfBuffCtrls, ctrl.id));
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

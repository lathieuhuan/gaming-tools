import type { IAbilityDebuffCtrl } from "@/types";

import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { SelfDebuffsView } from "@/components";

export default function DebuffSelf() {
  const { main, selfDebuffCtrls } = useShallowCalcStore((state) => {
    return Object_.pickProps(selectSetup(state), ["main", "selfDebuffCtrls"]);
  });

  const handleUpdateCtrls = (newCtrls: IAbilityDebuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.selfDebuffCtrls = newCtrls;
    });
  };

  return (
    <SelfDebuffsView
      mutable
      character={main}
      modCtrls={selfDebuffCtrls}
      getHanlders={(ctrl) => {
        const updateDebuffCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateCtrls(updateModCtrlInputs(selfDebuffCtrls, ctrl.id, inputIndex, value));
        };

        return {
          onToggle: () => {
            handleUpdateCtrls(toggleModCtrl(selfDebuffCtrls, ctrl.id));
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

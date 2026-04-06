import { Object_ } from "ron-utils";

import type { IAbilityDebuffCtrl } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { SelfDebuffsView } from "@/components";

export default function DebuffSelf() {
  const { main, team, selfDebuffCtrls } = useShallowCalcStore((state) => {
    return Object_.extract(selectSetup(state), ["main", "team", "selfDebuffCtrls"]);
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
      team={team}
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

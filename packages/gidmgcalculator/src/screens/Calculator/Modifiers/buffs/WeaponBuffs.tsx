import type { Party } from "@Src/types";
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectWeapon,
  changeModCtrlInput,
  toggleModCtrl,
  updateTeammateWeapon,
  type ToggleModCtrlPath,
} from "@Store/calculator-slice";
import { deepCopy, findByIndex } from "@Src/utils";
import { WeaponBuffsView } from "@Src/components";

export default function WeaponBuffs({ party }: { party: Party }) {
  const dispatch = useDispatch();
  const weapon = useSelector(selectWeapon);
  const weaponBuffCtrls = useSelector((state) => {
    return state.calculator.setupsById[state.calculator.activeId].wpBuffCtrls;
  });

  return (
    <WeaponBuffsView
      mutable
      {...{ party, weapon, wpBuffCtrls: weaponBuffCtrls }}
      getSelfHandlers={({ ctrl }) => {
        const path: ToggleModCtrlPath = {
          modCtrlName: "wpBuffCtrls",
          ctrlIndex: ctrl.index,
        };
        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          dispatch(changeModCtrlInput(Object.assign({ value, inputIndex }, path)));
        };
        return {
          onToggle: () => {
            dispatch(toggleModCtrl(path));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateBuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateBuffCtrlInput,
          onSelectOption: updateBuffCtrlInput,
        };
      }}
      getTeammateHandlers={({ teammateIndex, ctrl, ctrls }) => {
        const updateBuffCtrl = (value: number | "toggle", inputIndex = 0) => {
          const newBuffCtrls = deepCopy(ctrls);
          const targetCtrl = findByIndex(newBuffCtrls, ctrl.index);
          if (!targetCtrl) return;

          if (value === "toggle") {
            targetCtrl.activated = !ctrl.activated;
          } else if (targetCtrl?.inputs) {
            targetCtrl.inputs[inputIndex] = value;
          } else {
            return;
          }

          dispatch(
            updateTeammateWeapon({
              teammateIndex,
              buffCtrls: newBuffCtrls,
            })
          );
        };
        return {
          onToggle: () => {
            updateBuffCtrl("toggle");
          },
          onChangeText: updateBuffCtrl,
          onSelectOption: updateBuffCtrl,
        };
      }}
    />
  );
}

import type { ModifierInput } from "@Src/types";
import type { ToggleModCtrlPath } from "@Store/calculatorSlice/reducer-types";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { changeModCtrlInput, toggleModCtrl, updateTeammateWeapon } from "@Store/calculatorSlice";
import { selectParty, selectWeapon } from "@Store/calculatorSlice/selectors";

// Util
import { deepCopy, findByIndex } from "@Src/utils";

// Component
import { renderModifiers, renderWeaponModifiers } from "@Src/components";

export const WeaponBuffs = () => {
  const dispatch = useDispatch();
  const weapon = useSelector(selectWeapon);
  const weaponBuffCtrls = useSelector((state) => {
    return state.calculator.setupsById[state.calculator.activeId].wpBuffCtrls;
  });
  const party = useSelector(selectParty);

  const modifierElmts: (JSX.Element | null)[] = [];

  modifierElmts.push(
    ...renderWeaponModifiers({
      fromSelf: true,
      keyPrefix: "main",
      weapon,
      ctrls: weaponBuffCtrls,
      getHanlders: (ctrl, ctrlIndex) => {
        const path: ToggleModCtrlPath = {
          modCtrlName: "wpBuffCtrls",
          ctrlIndex,
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
      },
    })
  );

  party.forEach((teammate, teammateIndex) => {
    if (teammate) {
      const { buffCtrls } = teammate.weapon;

      modifierElmts.push(
        ...renderWeaponModifiers({
          keyPrefix: teammate.name,
          weapon: teammate.weapon,
          ctrls: teammate.weapon.buffCtrls,
          getHanlders: (ctrl) => {
            const updateBuffCtrl = (value: ModifierInput | "toggle", inputIndex = 0) => {
              const newBuffCtrls = deepCopy(buffCtrls);
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
          },
        })
      );
    }
  });

  return renderModifiers(modifierElmts, "buffs", true);
};

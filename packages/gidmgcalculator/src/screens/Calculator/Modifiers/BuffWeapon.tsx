import type { CalcTeammate } from "@/models/calculator";
import type { IWeaponBuffCtrl } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup, updateTeammateWeapon } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { WeaponBuffsView } from "@/components";

export default function BuffWeapon() {
  const { weapon, wpBuffCtrls, teammates } = useShallowCalcStore((state) => {
    const setup = selectSetup(state);

    return {
      weapon: setup.main.weapon,
      wpBuffCtrls: setup.wpBuffCtrls,
      teammates: setup.teammates,
    };
  });

  const handleUpdateSelfCtrls = (newCtrls: IWeaponBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.wpBuffCtrls = newCtrls;
    });
  };

  const handleUpdateTeammateCtrls = (teammate: CalcTeammate, newCtrls: IWeaponBuffCtrl[]) => {
    updateTeammateWeapon(teammate.data.code, {
      buffCtrls: newCtrls,
    });
  };

  return (
    <WeaponBuffsView
      mutable
      teammates={teammates}
      weapon={weapon}
      wpBuffCtrls={wpBuffCtrls}
      getSelfHandlers={(ctrl) => {
        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateSelfCtrls(updateModCtrlInputs(wpBuffCtrls, ctrl.id, inputIndex, value));
        };

        return {
          onToggle: () => {
            handleUpdateSelfCtrls(toggleModCtrl(wpBuffCtrls, ctrl.id));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateCtrlInput,
          onSelectOption: updateCtrlInput,
        };
      }}
      getTeammateHandlers={(teammate, ctrl) => {
        const buffCtrls = teammate.weapon.buffCtrls;

        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateTeammateCtrls(
            teammate,
            updateModCtrlInputs(buffCtrls, ctrl.id, inputIndex, value)
          );
        };

        return {
          onToggle: () => {
            handleUpdateTeammateCtrls(teammate, toggleModCtrl(buffCtrls, ctrl.id));
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

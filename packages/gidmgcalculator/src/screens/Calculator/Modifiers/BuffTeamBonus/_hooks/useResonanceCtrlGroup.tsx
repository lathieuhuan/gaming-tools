import type { Team } from "@/logic/calculator";
import type { ResonanceModCtrl } from "@/types";
import type { ControlGroup } from "../types";

import { ResonanceBuffItem } from "@/components/ModifierItems";
import { AutoResonanceBuffs } from "@/components/ModifierLists";
import { useCalcStore } from "@Store/calculator";
import { updateSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleRsnModCtrl, updateRsnModCtrlInputs } from "@Store/calculator/utils";

export function useResonanceCtrlGroup(team: Team): ControlGroup {
  const rsnBuffCtrls = useCalcStore((state) => selectSetup(state).rsnBuffCtrls);

  if (!rsnBuffCtrls.length && !team.resonances.length) {
    return {
      isEmpty: true,
    };
  }

  const handleToggle = (ctrl: ResonanceModCtrl) => {
    updateSetup((setup) => {
      setup.rsnBuffCtrls = toggleRsnModCtrl(rsnBuffCtrls, ctrl.element);
    });
  };

  const handleToggleInput =
    (ctrl: ResonanceModCtrl) => (currentInput: number, inputIndex: number) => {
      const input = currentInput === 1 ? 0 : 1;

      updateSetup((setup) => {
        setup.rsnBuffCtrls = updateRsnModCtrlInputs(rsnBuffCtrls, ctrl.element, inputIndex, input);
      });
    };

  const render = (className?: string) => (
    <div className={className}>
      <AutoResonanceBuffs resonances={team.resonances} />

      {rsnBuffCtrls.map((ctrl) => {
        return (
          <ResonanceBuffItem
            key={ctrl.element}
            mutable
            element={ctrl.element}
            checked={ctrl.activated}
            onToggle={() => handleToggle(ctrl)}
            inputs={ctrl.inputs}
            onToggleCheck={handleToggleInput(ctrl)}
          />
        );
      })}
    </div>
  );

  return {
    isEmpty: false,
    key: "resonance",
    render,
  };
}

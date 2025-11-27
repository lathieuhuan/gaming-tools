import type { ResonanceModCtrl } from "@/types";
import type { ControlGroup } from "../types";

import { AutoResonanceBuffs, ResonanceBuffItem } from "@/components";
import { useCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleRsnModCtrl, updateRsnModCtrlInputs } from "@Store/calculator/utils";

export function useResonanceCtrlGroup(): ControlGroup {
  const rsnBuffCtrls = useCalcStore((state) => selectSetup(state).rsnBuffCtrls);
  const team = useCalcStore((state) => selectSetup(state).team);

  if (!rsnBuffCtrls.length && !team.resonances.length) {
    return {
      isEmpty: true,
    };
  }

  const handleToggle = (ctrl: ResonanceModCtrl) => {
    updateActiveSetup((setup) => {
      setup.rsnBuffCtrls = toggleRsnModCtrl(rsnBuffCtrls, ctrl.element);
    });
  };

  const handleToggleInput =
    (ctrl: ResonanceModCtrl) => (currentInput: number, inputIndex: number) => {
      const input = currentInput === 1 ? 0 : 1;

      updateActiveSetup((setup) => {
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

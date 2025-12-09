import type { ResonanceModCtrl } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup, updateElementalEvent } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleRsnModCtrl } from "@Store/calculator/utils";

import { ResonanceDebuffItem, SuperconductDebuffItem } from "@/components";

export default function DebuffElement() {
  const { superconduct, rsnDebuffCtrls } = useShallowCalcStore((state) => {
    const setup = selectSetup(state);

    return {
      superconduct: setup.elmtEvent.superconduct,
      rsnDebuffCtrls: setup.rsnDebuffCtrls,
    };
  });

  const handleToggleRsnCtrls = (ctrl: ResonanceModCtrl) => {
    updateActiveSetup((setup) => {
      setup.rsnDebuffCtrls = toggleRsnModCtrl(setup.rsnDebuffCtrls, ctrl.element);
    });
  };

  return (
    <div className="pt-2 space-y-3">
      {rsnDebuffCtrls.map((ctrl) => {
        return (
          <ResonanceDebuffItem
            key={ctrl.element}
            mutable
            element={ctrl.element}
            checked={ctrl.activated}
            onToggle={() => handleToggleRsnCtrls(ctrl)}
          />
        );
      })}
      <SuperconductDebuffItem
        mutable
        checked={superconduct}
        onToggle={() => {
          updateElementalEvent({ superconduct: !superconduct });
        }}
      />
    </div>
  );
}

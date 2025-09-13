import { Resonance } from "@/types";
import { updateResonance } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";

import { RESONANCE_INFO, ResonanceBuffItem } from "@/components";

type ResonanceCtrlProps = {
  resonances: Resonance[];
};

export function ResonanceCtrl({ resonances }: ResonanceCtrlProps) {
  const dispatch = useDispatch();

  const handleToggleResonance = (resonance: Resonance) => {
    dispatch(
      updateResonance({
        ...resonance,
        activated: !resonance.activated,
      })
    );
  };

  const handleToggleResonanceInput = (resonance: Resonance) => (currentInput: number, inputIndex: number) => {
    if (resonance.inputs) {
      const newInputs = [...resonance.inputs];
      newInputs[inputIndex] = currentInput === 1 ? 0 : 1;

      dispatch(updateResonance({ ...resonance, inputs: newInputs }));
    }
  };

  return (
    <div className="space-y-3">
      {resonances.map((resonance) => {
        return (
          <ResonanceBuffItem
            key={resonance.vision}
            mutable
            element={resonance.vision}
            checked={resonance.activated}
            onToggle={() => handleToggleResonance(resonance)}
            inputs={resonance.inputs}
            inputConfigs={RESONANCE_INFO[resonance.vision]?.inputConfigs}
            onToggleCheck={handleToggleResonanceInput(resonance)}
          />
        );
      })}
    </div>
  );
}

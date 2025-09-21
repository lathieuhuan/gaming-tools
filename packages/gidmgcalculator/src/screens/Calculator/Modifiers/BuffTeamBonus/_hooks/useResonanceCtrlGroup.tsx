import { Resonance } from "@/types";
import { selectElmtModCtrls, updateResonance } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

import { RESONANCE_INFO, ResonanceBuffItem } from "@/components";
import { ControlGroup } from "../../_types";

export function useResonanceCtrlGroup(): ControlGroup {
  const dispatch = useDispatch();
  const { resonances } = useSelector(selectElmtModCtrls);

  if (!resonances.length) {
    return {
      isEmpty: true,
    };
  }

  const handleToggleResonance = (resonance: Resonance) => {
    dispatch(
      updateResonance({
        ...resonance,
        activated: !resonance.activated,
      })
    );
  };

  const handleToggleResonanceInput =
    (resonance: Resonance) => (currentInput: number, inputIndex: number) => {
      if (resonance.inputs) {
        const newInputs = [...resonance.inputs];
        newInputs[inputIndex] = currentInput === 1 ? 0 : 1;

        dispatch(updateResonance({ ...resonance, inputs: newInputs }));
      }
    };

  const render = (className?: string) => (
    <div className={className}>
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

  return {
    isEmpty: false,
    key: "resonance",
    render,
  };
}

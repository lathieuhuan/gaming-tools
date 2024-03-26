import { useState, useEffect } from "react";

import type { CalculationAspect } from "@Src/types";
import {
  selectCharacter,
  selectComparedIds,
  selectCalcFinalResult,
  selectParty,
  selectWeapon,
} from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { findById } from "@Src/utils";
import { FinalResultView } from "@Src/components";

const ASPECT_LABEL: Record<CalculationAspect, string> = {
  nonCrit: "Non-crit",
  crit: "Crit",
  average: "Average",
};

export function FinalResultCore() {
  const activeSetupName = useSelector((state) => {
    const { activeId, setupManageInfos } = state.calculator;
    return findById(setupManageInfos, activeId)?.name || "";
  });
  const finalResult = useSelector(selectCalcFinalResult);
  const char = useSelector(selectCharacter);
  const weapon = useSelector(selectWeapon);
  const party = useSelector(selectParty);

  const comparedIds = useSelector(selectComparedIds);

  const [focusedAspect, setFocus] = useState<CalculationAspect>("average");
  const comparing = comparedIds.length > 1;

  useEffect(() => {
    if (comparing) {
      setFocus("average");
    }
  }, [comparing]);

  const calculationAspects: CalculationAspect[] = ["nonCrit", "crit", "average"];

  return (
    <div className="h-full flex flex-col">
      {comparing ? (
        <div className="mb-4 flex">
          <p className="mr-2">Choose a focus</p>
          <select
            className="text-primary-1"
            value={focusedAspect}
            onChange={(e) => setFocus(e.target.value as CalculationAspect)}
          >
            {calculationAspects.map((aspect) => (
              <option key={aspect} value={aspect}>
                {ASPECT_LABEL[aspect]}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="mx-4 my-2 font-bold text-center">{activeSetupName}</p>
      )}
      <div className="grow hide-scrollbar">
        <FinalResultView
          key={char.name}
          {...{ char, weapon, party, finalResult }}
          focusedAspect={comparing ? focusedAspect : undefined}
        />
      </div>
    </div>
  );
}

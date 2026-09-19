import { ReactNode, useEffect, useState } from "react";
import { Array_, Object_ } from "ron-utils";

import { MAX_CALC_SETUPS } from "@/constants/config";
import { useShallowCalcStore } from "@Store/calculator";
import { MultiSetupChange } from "@Store/calculator/actions";
import { Context } from "./context";

export function SetupMultiUpdateKit({ children }: { children: ReactNode }) {
  const { setupManagers, comparedIds, standardId } = useShallowCalcStore((state) =>
    Object_.extract(state, ["setupManagers", "comparedIds", "standardId"]),
  );

  const [tempSetups, setTempSetups] = useState<MultiSetupChange[]>(
    setupManagers.map((manager) => ({
      ...manager,
      status: "OLD",
      isCompared: comparedIds.includes(manager.ID),
    })),
  );
  const [tempStandardId, setTempStandardId] = useState(
    Array_.findById(tempSetups, standardId)?.ID || 0,
  );

  const displayedSetups = tempSetups.filter((tempSetup) => tempSetup.status !== "REMOVED");
  const comparedSetups = displayedSetups.filter((tempSetup) => tempSetup.isCompared);

  useEffect(() => {
    if (comparedSetups.length === 0 && tempStandardId !== 0) {
      setTempStandardId(0);
    } else if (
      comparedSetups.length === 1 ||
      comparedSetups.every((comparedSetup) => comparedSetup.ID !== tempStandardId)
    ) {
      setTempStandardId(comparedSetups[0]?.ID || 0);
    }
  }, [comparedSetups.length, tempStandardId]);

  // const tryApplyNewSettings = (onSuccess?: () => void) => {
  //   if (!tempSetups.filter((tempSetup) => tempSetup.status !== "REMOVED").length) {
  //     setErrorCode("NO_SETUPS");
  //     return;
  //   }

  //   updateMultiSetups(tempSetups, tempStandardId);
  //   onSuccess?.();
  // };

  return (
    <Context.Provider
      value={{
        setups: displayedSetups,
        standardId: tempStandardId,
        canAddMoreSetup: tempSetups.length < MAX_CALC_SETUPS,
        updateSetups: setTempSetups,
        setStandardId: setTempStandardId,
      }}
    >
      {children}
    </Context.Provider>
  );
}

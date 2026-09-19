import { ReactNode, useReducer } from "react";
import { Object_ } from "ron-utils";

import { MAX_CALC_SETUPS } from "@/constants/config";
import { useShallowCalcStore } from "@Store/calculator";
import { MultiSetupChange, updateMultiSetups } from "@Store/calculator/actions";
import { Context } from "./context";
import { getVisibleSetups, setupDraftKitReducer } from "./reducer";

export function SetupDraftKit({ children }: { children: ReactNode }) {
  const {
    setupManagers,
    comparedIds,
    standardId: initialStandardId,
  } = useShallowCalcStore((state) =>
    Object_.extract(state, ["setupManagers", "comparedIds", "standardId"]),
  );

  const [state, dispatch] = useReducer(setupDraftKitReducer, undefined, () => {
    const setups = setupManagers.map<MultiSetupChange>((manager) => ({
      ...manager,
      status: "OLD",
      isCompared: comparedIds.includes(manager.ID),
    }));

    return { setups, standardId: initialStandardId };
  });

  const visibleSetups = getVisibleSetups(state.setups);
  const canAddMoreSetup = visibleSetups.length < MAX_CALC_SETUPS;

  const apply = () => {
    if (!visibleSetups.length) {
      return false;
    }

    updateMultiSetups(state.setups, state.standardId);
    return true;
  };

  return (
    <Context.Provider
      value={{
        setups: visibleSetups,
        standardId: state.standardId,
        canAddMoreSetup,
        dispatch,
        apply,
      }}
    >
      {children}
    </Context.Provider>
  );
}

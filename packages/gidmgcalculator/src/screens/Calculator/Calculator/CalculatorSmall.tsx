import { useState } from "react";

import { useCalcStore } from "@Store/calculator";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

// Components
import { ContextProvider } from "../ContextProvider";
import { BottomNavSmall } from "./BottomNavSmall";
import { ModifiersCard, ResultsCard, SetupCard, OverviewCard } from "./_cards";

export function CalculatorSmall() {
  const dispatch = useDispatch();
  const touched = useCalcStore((state) => state.setupManagers.length !== 0);
  const isModernUI = useSelector((state) => state.ui.isTabLayout);

  const [activePanelI, setActivePanelI] = useState(0);

  const onSelectSection = (index: number) => {
    setActivePanelI(index);
    dispatch(updateUI({ setupDirectorActive: false }));
  };

  return (
    <ContextProvider>
      {isModernUI ? (
        <div className="h-full flex flex-col border-t border-dark-line">
          <div className="grow overflow-hidden relative">
            <div
              className="h-full overflow-auto flex absolute left-0 top-0"
              style={{ width: "400%", transform: `translateX(calc(-25% * ${activePanelI}))` }}
            >
              <OverviewCard touched={touched} className="w-1/4" />
              <ModifiersCard touched={touched} className="w-1/4" />
              <SetupCard touched={touched} className="w-1/4" />
              <ResultsCard touched={touched} className="w-1/4" />
            </div>
          </div>

          {touched ? (
            <BottomNavSmall activePanelI={activePanelI} onSelectSection={onSelectSection} />
          ) : null}
        </div>
      ) : (
        <div className="h-full flex hide-scrollbar border-t border-dark-line relative snap-x snap-mandatory">
          <OverviewCard touched={touched} />
          <ModifiersCard touched={touched} />
          <SetupCard touched={touched} />
          <ResultsCard touched={touched} />
        </div>
      )}
    </ContextProvider>
  );
}

import { useState } from "react";

import { useCalcStore } from "@Store/calculator";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { getCards } from "./config";

// Components
import { ContextProvider } from "../ContextProvider";
import { BottomNavSmall } from "./BottomNavSmall";

export function CalculatorSmall() {
  const dispatch = useDispatch();
  const touched = useCalcStore((state) => state.setupManagers.length !== 0);
  const isModernUI = useSelector((state) => state.ui.isTabLayout);

  const [activePanelI, setActivePanelI] = useState(0);

  const Cards = getCards({ touched, isModernUI });

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
              {Cards.Overview({ className: "w-1/4" })}
              {Cards.Modifiers({ className: "w-1/4" })}
              {Cards.Setup({ className: "w-1/4" })}
              {Cards.Results({ className: "w-1/4" })}
            </div>
          </div>

          {touched ? (
            <BottomNavSmall activePanelI={activePanelI} onSelectSection={onSelectSection} />
          ) : null}
        </div>
      ) : (
        <div className="h-full flex hide-scrollbar border-t border-dark-line relative snap-x snap-mandatory">
          {Cards.Overview({ className: "snap-center" })}
          {Cards.Modifiers({ className: "snap-center" })}
          {Cards.Setup({ className: "snap-center" })}
          {Cards.Results({ className: "snap-center relative" })}
        </div>
      )}
    </ContextProvider>
  );
}

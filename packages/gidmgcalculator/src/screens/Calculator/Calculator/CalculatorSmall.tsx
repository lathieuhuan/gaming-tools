import { useState } from "react";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

// Components
import { ContextProvider } from "../ContextProvider";
import { CharacterOverview } from "../CharacterOverview";
import { FinalResult } from "../FinalResult";
import { Modifiers } from "../Modifiers";
import { SetupDirector } from "../SetupDirector";
import { SetupManager } from "../SetupManager";
import { BottomNavSmall } from "./BottomNavSmall";

import styles from "./styles.module.scss";

export function CalculatorSmall() {
  const dispatch = useDispatch();
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);
  const isModernUI = useSelector((state) => state.ui.isTabLayout);

  const [activePanelI, setActivePanelI] = useState(0);

  const PANEL = {
    Overview: (extraCls = "") => (
      <div className={`p-4 bg-surface-1 ${styles.card} ${extraCls}`}>
        <CharacterOverview touched={touched} />
      </div>
    ),
    Modifiers: (extraCls = "") => (
      <div className={`p-4 bg-surface-1 ${styles.card} ${extraCls}`}>
        {touched ? (
          // ========== PANEL 2 ==========
          <Modifiers />
        ) : null}
      </div>
    ),
    Setup: (extraCls = "") => (
      <div className={`p-4 bg-surface-3 relative ${styles.card} ${extraCls}`}>
        {touched ? (
          // ========== PANEL 3 ==========
          <SetupManager isModernUI={isModernUI} />
        ) : null}
        <SetupDirector className={styles.card} />
      </div>
    ),
    Results: (extraCls = "") => (
      <div className={`p-4 bg-surface-3 ${styles.card} ${extraCls}`}>
        {touched ? (
          // ========== PANEL 4 ==========
          <FinalResult />
        ) : null}
      </div>
    ),
  };

  const onSelectSection = (index: number) => {
    setActivePanelI(index);
    dispatch(updateUI({ setupDirectorActive: false }));
  };

  return (
    <ContextProvider>
      {isModernUI ? (
        <div className="h-full flex flex-col border-t border-surface-border">
          <div className="grow overflow-hidden relative">
            <div
              className="h-full overflow-auto flex absolute left-0 top-0"
              style={{ width: "400%", transform: `translateX(calc(-25% * ${activePanelI}))` }}
            >
              {PANEL.Overview("w-1/4")}
              {PANEL.Modifiers("w-1/4")}
              {PANEL.Setup("w-1/4")}
              {PANEL.Results("w-1/4")}
            </div>
          </div>

          {touched ? <BottomNavSmall activePanelI={activePanelI} onSelectSection={onSelectSection} /> : null}
        </div>
      ) : (
        <div className="h-full flex hide-scrollbar border-t border-surface-border relative snap-x snap-mandatory">
          {PANEL.Overview("snap-center")}
          {PANEL.Modifiers("snap-center")}
          {PANEL.Setup("snap-center")}
          {PANEL.Results("snap-center relative")}
        </div>
      )}
    </ContextProvider>
  );
}

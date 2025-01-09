import { memo } from "react";
import { clsx, useScreenWatcher } from "rond";

import { useSelector } from "@Store/hooks";
import { selectComparedIds } from "@Store/calculator-slice";
import { CharacterOverview, Modifiers, SetupManager, SetupDirector, FinalResult } from "@Src/screens/Calculator";

import styles from "../AppMain.styles.module.scss";

function LargeCalculator() {
  const screenWatcher = useScreenWatcher();
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);

  const isHugeScreen = screenWatcher.isFromSize("2xl");

  return (
    <div
      className={clsx("flex flex-col relative", styles["calculator-container"])}
      style={{
        maxWidth: isHugeScreen ? "none" : "98%",
      }}
    >
      <div className={clsx("grow flex items-center overflow-auto", styles.calculator)}>
        <div className="w-full flex h-98/100 gap-2">
          <div className={`p-4 bg-surface-1 ${styles.card}`}>
            {/* ========== PANEL 1 ========== */}
            <CharacterOverview touched={touched} />
          </div>

          <div className={`p-4 bg-surface-1 ${styles.card}`}>
            {touched ? (
              // ========== PANEL 2 ==========
              <Modifiers />
            ) : null}
          </div>

          <div className={`p-4 bg-surface-3 relative ${styles.card}`}>
            {touched ? (
              // ========== PANEL 3 ==========
              <SetupManager />
            ) : null}
            <SetupDirector className={styles.card} />
          </div>

          {/* ========== PANEL 4 ========== */}
          {touched ? (
            <FinalResultPanel isHugeScreen={isHugeScreen} />
          ) : (
            <div className={`bg-surface-3 ${styles.card}`} />
          )}
        </div>
      </div>
    </div>
  );
}

interface FinalResultPanelProps {
  isHugeScreen: boolean;
}
const FinalResultPanel = (props: FinalResultPanelProps) => {
  const comparedCount = useSelector(selectComparedIds).length;

  let width = 22;

  if (comparedCount > 1) {
    width += (comparedCount - 1) * 2;
  }

  return (
    <div
      className={`px-4 pt-2 pb-4 bg-surface-3 transition-size duration-200 relative ${styles.card}`}
      style={{
        width: `${width}rem`,
        maxWidth: props.isHugeScreen ? "30rem" : "22rem",
      }}
    >
      <FinalResult />
    </div>
  );
};

export const CalculatorLarge = memo(LargeCalculator);

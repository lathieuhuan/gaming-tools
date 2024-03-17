import clsx from "clsx";
import { memo } from "react";
import { useScreenWatcher } from "rond";

import { useSelector } from "@Store/hooks";
import { selectComparedIds } from "@Store/calculator-slice";

// Component
import CharacterOverview from "./CharacterOverview";
import Modifiers from "./Modifiers";
import FinalResult from "./FinalResult";
import SetupManager from "./SetupManager";

import styles from "./Calculator.styles.module.scss";

function CalculatorCore() {
  const screenWatcher = useScreenWatcher();
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);

  const isHugeScreen = screenWatcher.isFromSize("2xl");

  return (
    <div
      className={clsx("pb-1 flex items-center overflow-auto", styles.calculator)}
      style={{
        maxWidth: isHugeScreen ? "none" : "95%",
      }}
    >
      <div className="w-full h-98/100 flex space-x-2">
        <div className={`px-6 py-4 bg-dark-900 ${styles.card}`}>
          {/* ========== PANEL 1 ========== */}
          <CharacterOverview touched={touched} />
        </div>

        <div className={`px-6 py-4 bg-dark-900 ${styles.card}`}>
          {touched ? (
            // ========== PANEL 2 ==========
            <Modifiers />
          ) : null}
        </div>

        <div className={`p-4 relative bg-dark-500 overflow-hidden ${styles.card}`}>
          {touched ? (
            // ========== PANEL 3 ==========
            <SetupManager />
          ) : null}
        </div>

        {/* ========== PANEL 4 ========== */}
        {touched ? <FinalResultPanel isHugeScreen={isHugeScreen} /> : <div className={`bg-dark-500 ${styles.card}`} />}
      </div>
    </div>
  );
}

const FinalResultPanel = ({ isHugeScreen }: { isHugeScreen: boolean }) => {
  const comparedCount = useSelector(selectComparedIds).length;

  let width = 24;

  if (isHugeScreen) {
    width += (comparedCount - 1) * 2;
  }

  return (
    <div
      className={`px-4 pt-2 pb-6 bg-dark-500 transition-size duration-200 relative ${styles.card}`}
      style={{ width: `${width}rem`, maxWidth: isHugeScreen ? "30rem" : "22rem" }}
    >
      <FinalResult />
    </div>
  );
};

const Calculator = memo(CalculatorCore);

export default Calculator;

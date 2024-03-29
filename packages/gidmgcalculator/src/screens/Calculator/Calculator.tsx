import { memo, useRef, useState } from "react";
import { clsx, useScreenWatcher } from "rond";

import { useSelector } from "@Store/hooks";
import { selectComparedIds } from "@Store/calculator-slice";

// Component
import CharacterOverview from "./CharacterOverview";
import Modifiers from "./Modifiers";
import FinalResult from "./FinalResult";
import SetupManager from "./SetupManager";
import HigherSetupManager from "./HigherSetupManager";

import styles from "./Calculator.styles.module.scss";

function CalculatorCore() {
  const screenWatcher = useScreenWatcher();
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);
  const calculatorElmt = useRef<HTMLDivElement>(null);

  const isHugeScreen = screenWatcher.isFromSize("2xl");
  const isSmallScreen = screenWatcher.isToSize("sm");

  const onClickSectionNav = (index: number) => () => {
    if (calculatorElmt.current) {
      Array.from(calculatorElmt.current.children).forEach((section, sectionIndex) => {
        console.log(sectionIndex);
        console.log(section);

        sectionIndex === index ? section.classList.remove("hidden") : section.classList.add("hidden");
      });
    }
  };

  return (
    <div
      className={clsx("flex flex-col relative", isSmallScreen && "w-full pb-8", styles["calculator-container"])}
      style={{
        maxWidth: !isSmallScreen && !isHugeScreen ? "98%" : "none",
      }}
    >
      <div
        className={clsx(
          "grow flex items-center overflow-auto",
          isSmallScreen && "w-full h-full hide-scrollbar",
          styles.calculator
        )}
      >
        <div ref={calculatorElmt} className={`w-full flex ${isSmallScreen ? "h-full" : "h-98/100 gap-2"}`}>
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
            <HigherSetupManager />
          </div>

          {/* ========== PANEL 4 ========== */}
          {touched ? (
            <FinalResultPanel isHugeScreen={isHugeScreen} isSmallScreen={isSmallScreen} />
          ) : (
            <div className={`bg-surface-3 ${styles.card}`} />
          )}
        </div>
      </div>

      <div className={clsx("w-full fixed z-20 bottom-0", !isSmallScreen && "hidden")}>
        <div
          className={clsx("flex text-light-default font-semibold", styles["section-nav"])}
          style={{ boxShadow: "0 0 3px #fff" }}
        >
          {["Overview", "Modifiers", "Setup", "Results"].map((label, index) => {
            return (
              <button key={label} className="w-1/4 py-1" onClick={onClickSectionNav(index)}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface FinalResultPanelProps {
  isHugeScreen: boolean;
  isSmallScreen: boolean;
}
const FinalResultPanel = ({ isHugeScreen, isSmallScreen }: FinalResultPanelProps) => {
  const comparedCount = useSelector(selectComparedIds).length;

  let width = 22;

  if (isHugeScreen && comparedCount > 1) {
    width += (comparedCount - 1) * 2;
  }

  return (
    <div
      className={`px-4 pt-2 pb-4 bg-surface-3 transition-size duration-200 relative ${styles.card}`}
      style={
        isSmallScreen
          ? undefined
          : {
              width: `${width}rem`,
              maxWidth: isHugeScreen ? "30rem" : "22rem",
            }
      }
    >
      <FinalResult />
    </div>
  );
};

const Calculator = memo(CalculatorCore);

export default Calculator;

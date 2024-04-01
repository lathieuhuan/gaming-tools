import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet, SwitchNode } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import MyCharacters from "@Src/screens/MyCharacters";
import MyWeapons from "@Src/screens/MyWeapons";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MySetups from "@Src/screens/MySetups";
import {
  CharacterOverview,
  Modifiers,
  SetupManager,
  SetupDirector,
  FinalResult,
  CalculatorModalsProvider,
} from "@Src/screens/Calculator";

import styles from "./AppMain.styles.module.scss";
import { SmallSetupManager } from "./SmallSetupManager";

export function AppMainSmall() {
  const dispatch = useDispatch();
  const atScreen = useSelector((state) => state.ui.atScreen);
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);
  const [activePanelI, setActivePanelI] = useState(0);

  const onSelectSection = (index: number) => {
    setActivePanelI(index);
    dispatch(updateUI({ setupDirectorActive: false }));
  };

  return (
    <SwitchNode
      value={atScreen}
      cases={[
        {
          value: "MY_CHARACTERS",
          element: <MyCharacters />,
        },
        {
          value: "MY_WEAPONS",
          element: <MyWeapons />,
        },
        { value: "MY_ARTIFACTS", element: <MyArtifacts /> },
        { value: "MY_SETUPS", element: <MySetups /> },
      ]}
      default={
        <CalculatorModalsProvider>
          <div className="h-full flex flex-col border-t border-surface-border">
            <div className="grow flex overflow-auto relative">
              <SwitchNode
                value={activePanelI}
                cases={[
                  {
                    value: 0,
                    element: (
                      <div className={`p-4 bg-surface-1 ${styles.card}`}>
                        {/* ========== PANEL 1 ========== */}
                        <CharacterOverview touched={touched} />
                      </div>
                    ),
                  },
                  {
                    value: 1,
                    element: (
                      <div className={`p-4 bg-surface-1 ${styles.card}`}>
                        {touched ? (
                          // ========== PANEL 2 ==========
                          <Modifiers />
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    value: 2,
                    element: (
                      <div className={`p-4 bg-surface-3 relative ${styles.card}`}>
                        {touched ? (
                          // ========== PANEL 3 ==========
                          <SetupManager />
                        ) : null}
                        <SetupDirector className={styles.card} />
                      </div>
                    ),
                  },
                ]}
              />
              <div
                className={`p-4 bg-surface-3 ${styles.card} absolute full-stretch ${activePanelI === 3 ? "" : "-z-10"}`}
              >
                {touched ? (
                  // ========== PANEL 4 ==========
                  <FinalResult />
                ) : null}
              </div>
            </div>

            {touched ? <CalculatorNavBar activePanelI={activePanelI} onSelectSection={onSelectSection} /> : null}
          </div>
        </CalculatorModalsProvider>
      }
    />
  );
}

interface CalculatorNavBarProps {
  activePanelI: number;
  onSelectSection: (index: number) => void;
}
function CalculatorNavBar({ activePanelI, onSelectSection }: CalculatorNavBarProps) {
  const [optionsActive, setOptionsActive] = useState(false);

  const closeOptions = () => setOptionsActive(false);

  return (
    <>
      <div className="flex font-semibold border-t border-surface-border" style={{ backgroundColor: "#05071a" }}>
        {["Overview", "Modifiers", "Setup", "Results"].map((label, index) => {
          const isActive = index === activePanelI;

          return (
            <div
              key={label}
              className={"w-full py-2 flex-center " + (isActive ? "text-secondary-1" : "text-light-default/60")}
              onClick={() => onSelectSection(index)}
            >
              {label}
            </div>
          );
        })}

        <div className="my-auto w-px h-2/3 bg-surface-border" />
        <button type="button" className="shrink-0 w-10 flex-center rotate-180" onClick={() => setOptionsActive(true)}>
          <FaChevronDown />
        </button>
      </div>

      <BottomSheet active={optionsActive} title="Setups Manager" onClose={closeOptions}>
        <SmallSetupManager onClose={closeOptions} />
      </BottomSheet>
    </>
  );
}

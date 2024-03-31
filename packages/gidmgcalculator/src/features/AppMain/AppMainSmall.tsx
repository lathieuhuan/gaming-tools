import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet, SwitchNode } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { selectActiveId, selectSetupManageInfos, updateCalculator } from "@Store/calculator-slice";
import MyCharacters from "@Src/screens/MyCharacters";
import MyWeapons from "@Src/screens/MyWeapons";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MySetups from "@Src/screens/MySetups";
import { CharacterOverview, Modifiers, SetupManager, SetupDirector, FinalResult } from "@Src/screens/Calculator";

import styles from "./AppMain.styles.module.scss";

export function AppMainSmall() {
  const dispatch = useDispatch();
  const atScreen = useSelector((state) => state.ui.atScreen);
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);
  const [activeSectionI, setActiveSectionI] = useState(0);

  const onSelectSection = (index: number) => {
    setActiveSectionI(index);
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
        <div className="h-full flex flex-col">
          <div className="grow flex overflow-auto relative">
            <SwitchNode
              value={activeSectionI}
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
              className={`p-4 bg-surface-3 ${styles.card} absolute full-stretch ${activeSectionI === 3 ? "" : "-z-10"}`}
            >
              {touched ? (
                // ========== PANEL 4 ==========
                <FinalResult />
              ) : null}
            </div>
          </div>

          {touched ? <CalculatorNavBar activeSectionI={activeSectionI} onSelectSection={onSelectSection} /> : null}
        </div>
      }
    />
  );
}

interface CalculatorNavBarProps {
  activeSectionI: number;
  onSelectSection: (index: number) => void;
}
function CalculatorNavBar({ activeSectionI, onSelectSection }: CalculatorNavBarProps) {
  const dispatch = useDispatch();
  const manageInfos = useSelector(selectSetupManageInfos);
  const activeId = useSelector(selectActiveId);
  const [optionsActive, setOptionsActive] = useState(false);

  const currentSetup = manageInfos.find((info) => info.ID === activeId);

  const closeOptions = () => setOptionsActive(false);

  const onSelectSetup = (id: number) => {
    if (id !== currentSetup?.ID) {
      dispatch(updateCalculator({ activeId: id }));
    }
    closeOptions();
  };

  return (
    <>
      <div className="flex font-semibold border-t border-surface-border" style={{ backgroundColor: "#05071a" }}>
        {["Overview", "Modifiers", "Setups", "Results"].map((label, index) => {
          const isActive = index === activeSectionI;

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

      <BottomSheet active={optionsActive} title="Switch to setup" height="30%" onClose={closeOptions}>
        {manageInfos.map((info, i) => {
          const isCurrent = info.ID === currentSetup?.ID;

          return (
            <button
              key={i}
              type="button"
              className="px-6 w-full text-left font-semibold"
              onClick={() => onSelectSetup(info.ID)}
            >
              <div className="py-1.5 truncate whitespace-nowrap border-b border-surface-border">
                <span className={isCurrent ? " text-active-color" : ""}>{info.name}</span>
              </div>
            </button>
          );
        })}
      </BottomSheet>
    </>
  );
}

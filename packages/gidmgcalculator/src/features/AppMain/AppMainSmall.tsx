import { useState } from "react";
import { SwitchNode } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import MyCharacters from "@Src/screens/MyCharacters";
import MyWeapons from "@Src/screens/MyWeapons";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MySetups from "@Src/screens/MySetups";
import { CharacterOverview, Modifiers, SetupManager, SetupDirector, FinalResult } from "@Src/screens/Calculator";

import styles from "./AppMain.styles.module.scss";
import { updateUI } from "@Store/ui-slice";

export function AppMainSmall() {
  const dispatch = useDispatch();
  const atScreen = useSelector((state) => state.ui.atScreen);
  const touched = useSelector((state) => state.calculator.setupManageInfos.length !== 0);
  const [activeSectionI, setActiveSectionI] = useState(0);

  const onClickSectionNav = (index: number) => {
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

          {touched ? (
            <div
              className="flex font-semibold border-surface-border"
              style={{ backgroundColor: "#05071a", borderTopWidth: "1px" }}
            >
              {["Overview", "Modifiers", "Setup", "Results"].map((label, index) => {
                return (
                  <button
                    key={label}
                    className={`w-1/4 py-2 ${index === activeSectionI ? "text-secondary-1" : "text-light-default/60"}`}
                    // disabled={!touched}
                    onClick={() => onClickSectionNav(index)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      }
    />
  );
}

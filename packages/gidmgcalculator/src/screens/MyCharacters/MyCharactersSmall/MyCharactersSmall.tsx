import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet, CarouselSpace, SwitchNode } from "rond";

import { useDispatch } from "@Store/hooks";
import { viewCharacter } from "@Store/userdb-slice";

// Component
import { MobileBottomNav } from "@/components";
import { ActiveCharProvider } from "../ActiveCharProvider";
import { ContextProvider } from "../ContextProvider";
import { PanelAttributes } from "../PanelAttributes";
import { PanelConstellation } from "../PanelConstellation";
import { PanelGears } from "../PanelGears";
import { PanelTalents } from "../PanelTalents";
import { MyCharactersSmallMenu } from "./MyCharactersSmallMenu";

export function MyCharactersSmall() {
  const dispatch = useDispatch();
  const [activePanelI, setActivePanelI] = useState(0);
  const [menuActive, setMenuActive] = useState(false);

  const closeMenu = () => setMenuActive(false);

  return (
    <ContextProvider>
      <div className="h-full flex flex-col">
        <div className="p-4 grow hide-scrollbar bg-dark-1">
          <ActiveCharProvider>
            <SwitchNode
              value={activePanelI}
              cases={[
                { value: 0, element: <PanelAttributes /> },
                {
                  value: 1,
                  element: (
                    <PanelGears>
                      {({ detailActive, renderGearsOverview, renderGearsDetail, removeDetail }) => {
                        return (
                          <CarouselSpace
                            current={detailActive ? 1 : 0}
                            onTransitionEnd={() => !detailActive && removeDetail()}
                          >
                            {renderGearsOverview({
                              className: "mx-auto",
                              style: { maxWidth: "20rem" },
                            })}
                            {renderGearsDetail({ showCloseBtn: true })}
                          </CarouselSpace>
                        );
                      }}
                    </PanelGears>
                  ),
                },
                { value: 2, element: <PanelConstellation /> },
                { value: 3, element: <PanelTalents /> },
              ]}
            />
          </ActiveCharProvider>
        </div>

        <MobileBottomNav
          activeI={activePanelI}
          options={["Overview", "Gears", "Constellation", "Talents"]}
          onSelect={setActivePanelI}
          extraEnd={
            <>
              <div className="my-auto w-px h-2/3 bg-dark-line" />
              <button
                type="button"
                className="shrink-0 w-10 flex-center rotate-180"
                onClick={() => setMenuActive(true)}
              >
                <FaChevronDown />
              </button>
            </>
          }
        />

        <BottomSheet active={menuActive} height="90%" title="Switch to" onClose={closeMenu}>
          <MyCharactersSmallMenu
            onSelect={(name) => dispatch(viewCharacter(name))}
            onClose={closeMenu}
          />
        </BottomSheet>
      </div>
    </ContextProvider>
  );
}

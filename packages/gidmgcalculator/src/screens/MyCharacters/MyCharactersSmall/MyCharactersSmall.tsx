import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet, CarouselSpace, SwitchNode } from "rond";

import { useDispatch } from "@Store/hooks";
import { viewDbCharacter } from "@Store/userdb-slice";

// Component
import { MobileBottomNav, MobileBottomNavOption } from "@/components";
import { ActiveCharProvider } from "../ActiveCharProvider";
import { ContextProvider } from "../ContextProvider";
import { PanelAttributes } from "../PanelAttributes";
import { PanelConstellation } from "../PanelConstellation";
import { PanelGears } from "../PanelGears";
import { PanelTalents } from "../PanelTalents";
import { BottomMenu } from "./BottomMenu";

type PanelType = "ATTRIBUTES" | "GEARS" | "CONSTELATION" | "TALENTS";

export function MyCharactersSmall() {
  const dispatch = useDispatch();
  const [activePanel, setActivePanel] = useState<PanelType>("ATTRIBUTES");
  const [menuActive, setMenuActive] = useState(false);

  const closeMenu = () => setMenuActive(false);

  const panelOptions: MobileBottomNavOption<PanelType>[] = [
    { label: "Overview", value: "ATTRIBUTES" },
    { label: "Gears", value: "GEARS" },
    { label: "Constellation", value: "CONSTELATION" },
    { label: "Talents", value: "TALENTS" },
  ];

  return (
    <ContextProvider>
      <div className="h-full flex flex-col">
        <div className="p-4 grow hide-scrollbar bg-dark-1">
          <ActiveCharProvider>
            <SwitchNode
              value={activePanel}
              cases={[
                { value: "ATTRIBUTES", element: <PanelAttributes /> },
                {
                  value: "GEARS",
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
                { value: "CONSTELATION", element: <PanelConstellation /> },
                { value: "TALENTS", element: <PanelTalents /> },
              ]}
            />
          </ActiveCharProvider>
        </div>

        <MobileBottomNav
          value={activePanel}
          options={panelOptions}
          onSelect={(option) => setActivePanel(option.value)}
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
          <BottomMenu
            onSelect={(character) => dispatch(viewDbCharacter(character.code))}
            onClose={closeMenu}
          />
        </BottomSheet>
      </div>
    </ContextProvider>
  );
}

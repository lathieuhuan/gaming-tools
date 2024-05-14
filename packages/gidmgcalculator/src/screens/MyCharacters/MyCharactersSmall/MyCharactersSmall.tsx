import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet, CarouselSpace, SwitchNode } from "rond";

import { useDispatch } from "@Store/hooks";
import { viewCharacter } from "@Store/userdb-slice";

// Component
import { MobileBottomNav } from "@Src/components";
import {
  PanelAttributes,
  PanelConstellation,
  PanelGears,
  PanelTalents,
  MyCharacterDetailProviders,
} from "../MyCharacterDetail";
import { MyCharactersModalsProvider } from "../MyCharactersModalsProvider";
import { MyCharactersSmallMenu } from "./MyCharactersSmallMenu";

export function MyCharactersSmall() {
  const dispatch = useDispatch();
  const [activePanelI, setActivePanelI] = useState(0);
  const [menuActive, setMenuActive] = useState(false);

  const closeMenu = () => setMenuActive(false);

  return (
    <MyCharactersModalsProvider>
      <div className="h-full flex flex-col">
        <div className="p-4 grow hide-scrollbar bg-surface-1">
          <MyCharacterDetailProviders>
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
          </MyCharacterDetailProviders>
        </div>

        <MobileBottomNav
          activeI={activePanelI}
          options={["Overview", "Gears", "Constellation", "Talents"]}
          onSelect={setActivePanelI}
          extraEnd={
            <>
              <div className="my-auto w-px h-2/3 bg-surface-border" />
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
          <MyCharactersSmallMenu onSelect={(name) => dispatch(viewCharacter(name))} onClose={closeMenu} />
        </BottomSheet>
      </div>
    </MyCharactersModalsProvider>
  );
}

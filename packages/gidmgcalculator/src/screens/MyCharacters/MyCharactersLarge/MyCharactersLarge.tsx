import { HiddenSpace } from "rond";

import { ActiveCharProvider } from "../ActiveCharProvider";
import { ContextProvider } from "../ContextProvider";
import { PanelAttributes } from "../PanelAttributes";
import { PanelConstellation } from "../PanelConstellation";
import { PanelGears } from "../PanelGears";
import { PanelTalents } from "../PanelTalents";
import { MyCharactersTopBar } from "./MyCharactersTopBar";

export function MyCharactersLarge() {
  const sectionCls = "p-4 rounded-lg bg-dark-1";

  return (
    <ContextProvider>
      <div className="h-full flex flex-col bg-dark-3">
        <MyCharactersTopBar />

        <ActiveCharProvider>
          <div className="grow overflow-auto flex-center">
            <div className="py-4 flex h-98/100 space-x-2 custom-scrollbar" style={{ width: "92%" }}>
              <div className={sectionCls}>
                <PanelAttributes className="w-76" />
              </div>

              <PanelGears>
                {({ detailActive, renderGearsOverview, renderGearsDetail, removeDetail }) => {
                  return (
                    <div className="h-full flex">
                      <div className={sectionCls}>
                        <div className="h-full hide-scrollbar">
                          {renderGearsOverview({ className: "w-76" })}
                        </div>
                      </div>
                      <HiddenSpace
                        active={detailActive}
                        className="py-2 flex"
                        afterClose={removeDetail}
                      >
                        <div className={`${sectionCls} w-76 h-full ml-px rounded-l-none`}>
                          {renderGearsDetail()}
                        </div>
                      </HiddenSpace>
                    </div>
                  );
                }}
              </PanelGears>

              <div className={sectionCls}>
                <PanelConstellation className="w-76" />
              </div>

              <div className={sectionCls}>
                <PanelTalents className="w-76" />
              </div>
            </div>
          </div>
        </ActiveCharProvider>
      </div>
    </ContextProvider>
  );
}

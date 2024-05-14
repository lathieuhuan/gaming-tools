import { HiddenSpace } from "rond";
import {
  PanelAttributes,
  PanelConstellation,
  PanelGears,
  PanelTalents,
  MyCharacterDetailProviders,
} from "../MyCharacterDetail";
import { MyCharactersModalsProvider } from "../MyCharactersModalsProvider";
import { MyCharactersTopBar } from "./MyCharactersTopBar";

export function MyCharactersLarge() {
  const sectionCls = "p-4 rounded-lg bg-surface-1";

  return (
    <MyCharactersModalsProvider>
      <div className="h-full flex flex-col bg-surface-3">
        <MyCharactersTopBar />

        <MyCharacterDetailProviders>
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
                        <div className="h-full hide-scrollbar">{renderGearsOverview({ className: "w-76" })}</div>
                      </div>
                      <HiddenSpace active={detailActive} className="py-2 flex" afterClose={removeDetail}>
                        <div className={`${sectionCls} w-76 h-full ml-px rounded-l-none`}>{renderGearsDetail()}</div>
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
        </MyCharacterDetailProviders>
      </div>
    </MyCharactersModalsProvider>
  );
}

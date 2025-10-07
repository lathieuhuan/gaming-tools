import { useSelector } from "@Store/hooks";
import { useState } from "react";
import { CloseButton, clsx, Drawer, SideBarSvg, useScreenWatcher } from "rond";

import { SCREEN_PATH } from "@/constants";
import { useRouter } from "@/systems/router";
import { ScreenConfig } from "./_config";

import { NavOptions } from "./NavOptions";
import { OptimizerButton } from "./OptimizerButton";
import { TargetButton } from "./TargetButton";
import { TrackerButton } from "./TrackerButton";

type LeftSideProps = {
  appReady?: boolean;
};

export function LeftSide({ appReady }: LeftSideProps) {
  const router = useRouter();
  const isTabLayout = useSelector((state) => state.ui.isTabLayout);
  const screenWatcher = useScreenWatcher();

  const [drawerActive, setDrawerActive] = useState(false);

  const isMobile = !screenWatcher.isFromSize("md");
  const showOnMobileTab = isMobile && isTabLayout;

  const handleSelectScreen = (option: ScreenConfig) => {
    router.navigate(option.path);
  };

  const closeDrawer = () => setDrawerActive(false);

  return (
    <div className={clsx("flex", isMobile && "divide-x divide-dark-line")}>
      {isMobile ? (
        <button
          className="size-8 flex-center bg-dark-3 text-xl disabled:opacity-50"
          disabled={!appReady}
          onClick={() => setDrawerActive(true)}
        >
          <SideBarSvg />
        </button>
      ) : (
        <NavOptions
          className="flex flex-row-reverse"
          isOptionActive={(option) => router.isRouteActive(option.path)}
          disabled={!appReady}
          onSelect={handleSelectScreen}
        />
      )}

      {router.isRouteActive(SCREEN_PATH.CALCULATOR) && (
        <>
          {showOnMobileTab && <TargetButton />}
          <TrackerButton />
          {showOnMobileTab && <OptimizerButton />}
        </>
      )}

      <Drawer
        active={drawerActive}
        destroyOnClose
        style={{
          boxShadow: "0 0 1.5px #b8b8b8",
        }}
        width={240}
        className="p-4 bg-dark-2"
        position="left"
        onClose={closeDrawer}
      >
        <div className="flex justify-between items-center">
          <p>Go to</p>
          <CloseButton boneOnly onClick={closeDrawer} />
        </div>

        <NavOptions
          className="mt-4 space-y-2"
          itemClassName="rounded"
          isOptionActive={(option) => router.isRouteActive(option.path)}
          disabled={!appReady}
          onSelect={(option) => {
            handleSelectScreen(option);
            closeDrawer();
          }}
        />
      </Drawer>
    </div>
  );
}

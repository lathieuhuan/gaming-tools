import { useState } from "react";
import { TbLayoutSidebar } from "react-icons/tb";
import { CloseButton, clsx, Drawer, useScreenWatcher } from "rond";

import type { ScreenConfig } from "./config";

import { SCREEN_PATH } from "@/constants/config";
import { useRouter } from "@/lib/router";
import { useSettingsStore } from "@Store/settings";

import { NavOptions } from "./NavOptions";
import { TargetButton } from "./TargetButton";
import { TrackerButton } from "./TrackerButton";

type LeftSideProps = {
  appReady?: boolean;
};

export function LeftSide({ appReady }: LeftSideProps) {
  const router = useRouter();
  const isTabLayout = useSettingsStore((state) => state.isTabLayout);
  const screenWatcher = useScreenWatcher();

  const [drawerActive, setDrawerActive] = useState(false);

  const isMobile = !screenWatcher.isFromSize("md");
  const showOnMobileTab = isMobile && isTabLayout;

  const handleSelectScreen = (option: ScreenConfig) => {
    router.navigate({ to: option.path });
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
          <TbLayoutSidebar className="text-xl" />
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
        </>
      )}

      <Drawer
        active={drawerActive}
        className="p-4 bg-dark-2 shadow-popup"
        destroyOnClose
        width={240}
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

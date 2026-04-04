import { useLayoutEffect, useMemo } from "react";
import { useScreenWatcher } from "rond";

import { Outlet, useRouter } from "@/lib/router";
import { genAccountTravelerKey } from "@/logic/genAccountTravelerKey";
import { ArtifactState, WeaponState } from "@/models";
import { CalculatorLarge, CalculatorSmall } from "@/screens/Calculator";
import { $AppCharacter } from "@/services";
import { AppSettingsState, useSettingsStore } from "@Store/settings";

export function Main() {
  const screenWatcher = useScreenWatcher();
  const router = useRouter();
  const traveler = useSettingsStore((state) => state.traveler);
  const travelerKey = useMemo(() => genAccountTravelerKey(traveler), [traveler]);

  const isMobile = !screenWatcher.isFromSize("sm");
  const isAtRoot = router.isRouteActive("/");

  const updateEntityConfigs = (settings: AppSettingsState) => {
    ArtifactState.configure({
      defaultLevel: settings.artLevel,
    });
    WeaponState.configure({
      defaultLevel: settings.wpLevel,
      defaultRefi: settings.wpRefi,
    });
  };

  useLayoutEffect(() => {
    $AppCharacter.changeTraveler(traveler);

    updateEntityConfigs(useSettingsStore.getState());

    return useSettingsStore.subscribe(updateEntityConfigs);
  }, []);

  if (isMobile) {
    return isAtRoot ? <CalculatorSmall key={travelerKey} /> : <Outlet key={travelerKey} />;
  }

  return (
    <div key={travelerKey} className="h-full flex-center relative">
      <CalculatorLarge />

      {!isAtRoot && (
        <div className="absolute inset-0 z-30">
          <Outlet />
        </div>
      )}
    </div>
  );
}

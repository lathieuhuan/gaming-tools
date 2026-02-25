import { useLayoutEffect, useMemo } from "react";
import { useScreenWatcher } from "rond";

import { genAccountTravelerKey } from "@/logic/genAccountTravelerKey";
import { CalculatorLarge, CalculatorSmall } from "@/screens/Calculator";
import { $AppCharacter } from "@/services";
import { Outlet, useRouter } from "@/systems/router";
import { useSettingsStore } from "@Store/settings";

export function Main() {
  const screenWatcher = useScreenWatcher();
  const router = useRouter();
  const traveler = useSettingsStore((state) => state.traveler);
  const travelerKey = useMemo(() => genAccountTravelerKey(traveler), [traveler]);

  const isMobile = !screenWatcher.isFromSize("sm");
  const isAtRoot = router.isRouteActive("/");

  useLayoutEffect(() => {
    $AppCharacter.changeTraveler(traveler);
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

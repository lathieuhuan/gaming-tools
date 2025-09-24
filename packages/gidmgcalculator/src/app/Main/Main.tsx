import { useLayoutEffect, useMemo } from "react";
import { useScreenWatcher } from "rond";

import { CalculatorLarge, CalculatorSmall } from "@/screens/Calculator";
import { Outlet, useRouter } from "@/systems/router";
import { genAccountTravelerKey, selectTraveler } from "@Store/account-slice";
import { useSelector } from "@Store/hooks";
import { $AppCharacter } from "@/services";

export function Main() {
  const screenWatcher = useScreenWatcher();
  const router = useRouter();
  const traveler = useSelector(selectTraveler);

  const isMobile = !screenWatcher.isFromSize("sm");
  const isAtRoot = router.isRouteActive("/");

  useLayoutEffect(() => {
    $AppCharacter.changeTraveler(traveler);
  }, []);

  const travelerKey = useMemo(() => genAccountTravelerKey(traveler), [traveler]);

  if (isMobile) {
    return isAtRoot ? <CalculatorSmall key={travelerKey} /> : <Outlet />;
  }

  return (
    <div className="h-full flex-center relative">
      <CalculatorLarge key={travelerKey} />

      {!isAtRoot && (
        <div className="absolute inset-0 z-30">
          <Outlet />
        </div>
      )}
    </div>
  );
}

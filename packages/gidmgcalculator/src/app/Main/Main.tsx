import { useLayoutEffect } from "react";
import { useScreenWatcher } from "rond";

import { useTravelerKey } from "@/hooks";
import { CalculatorLarge, CalculatorSmall } from "@/screens/Calculator";
import { $AppCharacter } from "@/services";
import { Outlet, useRouter } from "@/systems/router";

export function Main() {
  const screenWatcher = useScreenWatcher();
  const router = useRouter();
  const [travelerKey, traveler] = useTravelerKey();

  const isMobile = !screenWatcher.isFromSize("sm");
  const isAtRoot = router.isRouteActive("/");

  useLayoutEffect(() => {
    $AppCharacter.changeTraveler(traveler);
  }, []);

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

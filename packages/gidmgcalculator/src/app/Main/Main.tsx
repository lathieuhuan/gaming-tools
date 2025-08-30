import { useScreenWatcher } from "rond";

import { CalculatorLarge, CalculatorSmall } from "@/screens/Calculator";
import { Outlet, useRouter } from "@/systems/router";

export function Main() {
  const screenWatcher = useScreenWatcher();
  const router = useRouter();

  const isMobile = !screenWatcher.isFromSize("sm");
  const isAtRoot = router.isRouteActive("/");

  if (isMobile) {
    return isAtRoot ? <CalculatorSmall /> : <Outlet />;
  }

  return (
    <div className="h-full flex-center relative">
      <CalculatorLarge />

      {!isAtRoot && (
        <div className="absolute full-stretch z-30">
          <Outlet />
        </div>
      )}
    </div>
  );
}

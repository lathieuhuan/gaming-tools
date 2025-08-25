import { useContext, useMemo } from "react";

import { OutletRouteContext } from "../contexts/OutletRouteContext";
import { getOutletRoute } from "../logic/getOutletRoute";

export function Outlet() {
  const route = useContext(OutletRouteContext);

  const config = useMemo(() => {
    if (!route) {
      return null;
    }
    const children = <route.config.element />;
    const outlet = getOutletRoute(route.nextSegments, route.config.children);

    return {
      children,
      outlet,
    };
  }, [route?.config.path]);

  if (!config) {
    return null;
  }

  return <OutletRouteContext.Provider value={config.outlet}>{config.children}</OutletRouteContext.Provider>;
}

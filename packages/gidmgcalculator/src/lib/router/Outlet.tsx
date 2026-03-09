import { useContext, useMemo } from "react";

import type { NotFoundRoute, OutletRoute } from "./types";

import { OutletRouteContext } from "./contexts/OutletRouteContext";
import { getOutletRoute } from "./logic/getOutletRoute";

function getRouteKey(route: OutletRoute | NotFoundRoute | null) {
  if (!route) {
    return undefined;
  }
  if ("component" in route) {
    return "notfound";
  }
  return route.config.path;
}

export function Outlet() {
  const route = useContext(OutletRouteContext);

  const config = useMemo(() => {
    if (!route) {
      return null;
    }
    if ("component" in route) {
      return {
        children: <route.component />,
        outlet: null,
      };
    }

    const { config, nextSegments } = route;
    const children = <config.component />;
    const outlet = getOutletRoute(nextSegments, config.children);

    return {
      children,
      outlet,
    };
  }, [getRouteKey(route)]);

  if (!config) {
    return null;
  }

  return (
    <OutletRouteContext.Provider value={config.outlet}>
      {config.children}
    </OutletRouteContext.Provider>
  );
}

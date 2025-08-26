import { useContext, useMemo } from "react";

import { OutletRouteContext } from "../contexts/OutletRouteContext";
import { getOutletRoute } from "../logic/getOutletRoute";

export function Outlet() {
  const route = useContext(OutletRouteContext);

  const config = useMemo(() => {
    if (!route) {
      return null;
    }
    const { config, nextSegments } = route;
    const children = <config.component />;
    let outlet = getOutletRoute(nextSegments, config.children);

    if (!outlet && config.defaultChild) {
      outlet = {
        config: {
          ...config.defaultChild,
          path: "/",
        },
        nextSegments,
      };
    }

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

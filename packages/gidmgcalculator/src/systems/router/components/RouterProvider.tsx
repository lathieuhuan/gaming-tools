import { useEffect, useMemo, useState } from "react";

import { OutletRouteContext } from "../contexts/OutletRouteContext";
import { getOutletRoute } from "../logic/getOutletRoute";
import { RouteConfig } from "../types";
import { checkIsChildSegments, toSegments } from "../utils";
import { NotFound } from "./NotFound";

function getPath() {
  return window.location.pathname + window.location.search;
}

type RouterProviderProps = {
  routes: RouteConfig[];
};

export function RouterProvider({ routes }: RouterProviderProps) {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handlePopState = () => {
      setPath(getPath);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const { children, outlet } = useMemo(() => {
    const segments = toSegments(path);
    let root: RouteConfig | undefined;
    let currentRoute: RouteConfig | undefined;

    // TODO: check :segment in path

    for (const route of routes) {
      if (route.path === "/") {
        root = route;
      } else if (checkIsChildSegments(toSegments(route.path), segments)) {
        currentRoute = route;
        break;
      }
    }

    currentRoute ||= root;

    const children = currentRoute ? <currentRoute.element /> : <NotFound />;
    const outlet = getOutletRoute(toSegments(path), currentRoute?.children);

    return {
      children,
      outlet,
    };
  }, [path]);

  return <OutletRouteContext.Provider value={outlet}>{children}</OutletRouteContext.Provider>;
}

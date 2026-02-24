import { useEffect, useMemo, useSyncExternalStore } from "react";

import type { NotFoundRoute, RootRouteConfig } from "./types";

import { getOutletRoute } from "./logic/getOutletRoute";
import { router, setSearchParams, store, watchPopState } from "./logic/router";
import { toPathSegments } from "./utils";

import { OutletRouteContext } from "./contexts/OutletRouteContext";
import { RouterContext } from "./contexts/RouterContext";
import { SearchParamsContext } from "./contexts/SearchParamsContext";
import { NotFound } from "./NotFound";

type RouterProviderProps = {
  route: RootRouteConfig;
};

export function RouterProvider({ route }: RouterProviderProps) {
  useEffect(() => {
    return watchPopState();
  }, []);

  const pathname = useSyncExternalStore(store.subscribePathname, store.getPathname);
  const searchParams = useSyncExternalStore(store.subscribeSearchParams, store.getSearchParams);

  const notFoundRoute: NotFoundRoute = {
    component: route.notFound || NotFound,
  };

  const { children, outlet, routerClone } = useMemo(() => {
    const segments = toPathSegments(pathname);

    const outlet = getOutletRoute(segments, route.children) || notFoundRoute;

    return {
      children: <route.component />,
      outlet,
      routerClone: {
        ...router,
      },
    };
  }, [pathname]);

  return (
    <RouterContext.Provider value={routerClone}>
      <SearchParamsContext.Provider value={[searchParams, setSearchParams]}>
        <OutletRouteContext.Provider value={outlet}>{children}</OutletRouteContext.Provider>
      </SearchParamsContext.Provider>
    </RouterContext.Provider>
  );
}

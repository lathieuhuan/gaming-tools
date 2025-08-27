import { useEffect, useMemo, useState } from "react";

import { OutletRouteContext } from "../contexts/OutletRouteContext";
import { Router, RouterContext } from "../contexts/RouterContext";
import { getOutletRoute } from "../logic/getOutletRoute";
import { RootRouteConfig, SearchParams } from "../types";
import { checkIsChildSegments, objectToSearchString, searchStringToObject, toSegments } from "../utils";

import { NotFound } from "./NotFound";

function getPath() {
  return window.location.pathname + window.location.search;
}

type RouterProviderProps = {
  route: RootRouteConfig;
};

export function RouterProvider({ route }: RouterProviderProps) {
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

  const { children, outlet, router } = useMemo(() => {
    const [pathname, params] = path.split("?");
    const segments = toSegments(pathname);

    // Outlet

    const outlet = getOutletRoute(segments, route.children) || {
      component: route.notFound || NotFound,
    };

    // Router

    const searchParams = params ? searchStringToObject(params) : undefined;

    const navigate = (path: string, searchParams?: SearchParams) => {
      const search = searchParams ? `?${objectToSearchString(searchParams)}` : "";
      const newPath = path + search;

      setPath(newPath);
      window.history.pushState(null, "", window.location.origin + newPath);
    };

    const router: Router = {
      pathname,
      searchParams,
      navigate,
      updateSearchParams: (params: SearchParams, replace?: boolean) => {
        const newParams = replace ? params : { ...searchParams, ...params };
        navigate(pathname, newParams);
      },
      isRouteActive: (path: string) => {
        return path === "/" ? pathname === "/" : checkIsChildSegments(toSegments(path), segments);
      },
    };

    return {
      children: <route.component />,
      outlet,
      router,
    };
  }, [path]);

  return (
    <RouterContext.Provider value={router}>
      <OutletRouteContext.Provider value={outlet}>{children}</OutletRouteContext.Provider>
    </RouterContext.Provider>
  );
}

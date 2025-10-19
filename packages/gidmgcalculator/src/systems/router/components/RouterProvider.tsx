import { useEffect, useMemo, useState } from "react";

import { OutletRouteContext } from "../contexts/OutletRouteContext";
import { Router, RouterContext } from "../contexts/RouterContext";
import {
  SearchParamsContext,
  SearchParamsContextState,
  SetSearchParams,
} from "../contexts/SearchParamsContext";
import { getOutletRoute } from "../logic/getOutletRoute";
import { navigate } from "../logic/navigate";
import { RootRouteConfig } from "../types";
import { checkIsChildSegments, getSearchParams, toPathSegments } from "../utils";

import { NotFound } from "./NotFound";

type RouterProviderProps = {
  route: RootRouteConfig;
};

export function RouterProvider({ route }: RouterProviderProps) {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(getSearchParams());

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
      setSearchParams(getSearchParams());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const searchParamsState = useMemo<SearchParamsContextState>(() => {
    const setFn: SetSearchParams = (value, replaceHistory = false) => {
      const newParams = typeof value === "function" ? value(searchParams) : value;

      setSearchParams(newParams);
      navigate(pathname, newParams, replaceHistory);
    };

    return [searchParams, setFn];
  }, [pathname, searchParams]);

  const { children, outlet, router } = useMemo(() => {
    const segments = toPathSegments(pathname);

    const outlet = getOutletRoute(segments, route.children) || {
      component: route.notFound || NotFound,
    };

    const router: Router = {
      pathname,
      navigate: (pathname, searchParams = {}, replaceHistory) => {
        setPathname(pathname);
        setSearchParams(searchParams);
        navigate(pathname, searchParams, replaceHistory);
      },
      isRouteActive: (path: string) => {
        return path === "/" ? pathname === "/" : checkIsChildSegments(toPathSegments(path), segments);
      },
    };

    return {
      children: <route.component />,
      outlet,
      router,
    };
  }, [pathname]);

  return (
    <RouterContext.Provider value={router}>
      <SearchParamsContext.Provider value={searchParamsState}>
        <OutletRouteContext.Provider value={outlet}>{children}</OutletRouteContext.Provider>
      </SearchParamsContext.Provider>
    </RouterContext.Provider>
  );
}

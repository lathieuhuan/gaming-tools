import { useEffect, useMemo, useState } from "react";
import { BrowserRouterContext, Router, SearchParams } from "./context";
import { objectToSearchString, searchStringToObject } from "./utils";

function getPath() {
  return window.location.pathname + window.location.search;
}

interface BrowserRouterProps {
  children: React.ReactNode;
}

export function BrowserRouter({ children }: BrowserRouterProps) {
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

  const router = useMemo<Router>(() => {
    const [pathname, params] = path.split("?");
    const searchParams = params ? searchStringToObject(params) : undefined;

    return {
      pathname,
      searchParams,
      navigate: (path: string, searchParams?: SearchParams) => {
        const search = searchParams ? `?${objectToSearchString(searchParams)}` : "";
        const newPath = path + search;

        setPath(newPath);
        window.history.pushState(null, "", window.location.origin + newPath);
      },
    };
  }, [path]);

  return <BrowserRouterContext.Provider value={router}>{children}</BrowserRouterContext.Provider>;
}

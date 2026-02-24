import { createContext, useContext } from "react";

import type { Router } from "../logic/router";

export const RouterContext = createContext<Router>({
  navigate: () => false,
  setSearchParams: () => false,
  isRouteActive: () => false,
});

export function useRouter() {
  return useContext(RouterContext);
}

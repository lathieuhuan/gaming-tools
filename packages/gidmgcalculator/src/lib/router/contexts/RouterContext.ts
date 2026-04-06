import { createContext, useContext } from "react";

import type { Router } from "../logic/router";

export const RouterContext = createContext<Router | null>(null);

export function useRouter() {
  const router = useContext(RouterContext);

  if (!router) {
    throw new Error("useRouter must be used within a RouterProvider");
  }

  return router;
}

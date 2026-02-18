import { createContext, useContext } from "react";
import { NavigateFn } from "../_logic/navigate";

export type Router = {
  pathname: string;
  navigate: (...args: Parameters<NavigateFn>) => void;
  isRouteActive: (path: string) => boolean;
};

export const RouterContext = createContext<Router>({
  pathname: "/",
  navigate: () => {},
  isRouteActive: () => false,
});

export function useRouter() {
  return useContext(RouterContext);
}

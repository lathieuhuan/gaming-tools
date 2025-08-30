import { createContext, useContext } from "react";
import { SearchParams } from "../types";

export type Router<T = SearchParams> = {
  pathname: string;
  searchParams?: T;
  navigate: (path: string, searchParams?: Partial<SearchParams>) => void;
  updateSearchParams: (searchParams: Partial<SearchParams>, replace?: boolean) => void;
  isRouteActive: (path: string) => boolean;
};

export const RouterContext = createContext<Router>({
  pathname: "/",
  navigate: () => {},
  updateSearchParams: () => {},
  isRouteActive: () => false,
});

export function useRouter<T = SearchParams>() {
  return useContext(RouterContext) as Router<T>;
}

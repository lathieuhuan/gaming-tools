import { createContext } from "react";

export type SearchParamValue = string | number | boolean | (string | number | boolean)[];

export type SearchParams = Record<string, SearchParamValue>;

export type Router<T = SearchParams> = {
  pathname: string;
  searchParams?: T;
  navigate: (path: string, searchParams?: SearchParams) => void;
  updateSearchParams: (searchParams: SearchParams, replace?: boolean) => void;
};

export const BrowserRouterContext = createContext<Router>({
  pathname: "/",
  navigate: () => {},
  updateSearchParams: () => {},
});

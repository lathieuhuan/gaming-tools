import { createContext, useContext } from "react";

import type { SearchParams } from "../types";
import { setSearchParams } from "../logic/router";

type SearchParamsContextState<T extends SearchParams = SearchParams> = [T, typeof setSearchParams];

export const SearchParamsContext = createContext<SearchParamsContextState>([{}, setSearchParams]);

export function useSearchParams<T extends SearchParams = SearchParams>() {
  return useContext(SearchParamsContext) as SearchParamsContextState<T>;
}

import { createContext, useContext } from "react";
import { SearchParams } from "../types";

export const SearchParamsContext = createContext<SearchParams>({});

export function useSearchParams<T extends SearchParams>() {
  return useContext(SearchParamsContext) as T;
}

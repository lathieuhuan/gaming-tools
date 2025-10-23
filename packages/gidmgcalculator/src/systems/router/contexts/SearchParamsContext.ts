import { createContext, SetStateAction, useContext } from "react";
import { SearchParams } from "../types";

export type SetSearchParams<T extends SearchParams = SearchParams> = (
  value: SetStateAction<T>,
  replaceHistory?: boolean
) => void;

export type SearchParamsContextState<T extends SearchParams = SearchParams> = [
  T,
  SetSearchParams<T>
];

export const SearchParamsContext = createContext<SearchParamsContextState<SearchParams>>([
  {},
  () => {},
]);

export function useSearchParams<T extends SearchParams = SearchParams>() {
  return useContext(SearchParamsContext) as unknown as SearchParamsContextState<T>;
}

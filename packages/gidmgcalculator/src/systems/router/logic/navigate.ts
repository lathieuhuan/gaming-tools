import { SearchParams } from "../types";
import { objectToSearchString } from "../utils";

export function navigate(pathname: string, searchParams?: SearchParams, replaceHistory?: boolean) {
  const searchString = searchParams ? objectToSearchString(searchParams) : "";
  const search = searchString ? `?${searchString}` : "";
  const fullpath = pathname + search;
  const currentPath = window.location.pathname + window.location.search;

  if (fullpath !== currentPath) {
    if (replaceHistory) {
      window.history.replaceState(null, "", window.location.origin + fullpath);
    } else {
      window.history.pushState(null, "", window.location.origin + fullpath);
    }

    return { fullpath, navigated: true };
  }

  return { fullpath, navigated: false };
}

export type NavigateFn = typeof navigate;

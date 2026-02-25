import isEqual from "react-fast-compare";

import type { SearchParams } from "../types";

import {
  checkIsChildSegments,
  getSearchParams,
  objectToSearchString,
  toPathSegments,
} from "../utils";
import { Subject } from "@/utils/Subject";

let pathname = window.location.pathname;
let searchParams = getSearchParams();

const pathnameSubject = new Subject<string>();
const searchParamsSubject = new Subject<SearchParams>();

export const store = {
  subscribePathname: pathnameSubject.subscribe.bind(pathnameSubject),
  subscribeSearchParams: searchParamsSubject.subscribe.bind(searchParamsSubject),
  getPathname: () => pathname,
  getSearchParams: () => searchParams,
};

function handleNewLocation(path: string, search: SearchParams) {
  let isNewPath = false;
  let isNewSearch = false;

  if (path !== pathname) {
    isNewPath = true;
    pathname = path;
    pathnameSubject.next(pathname);
  }

  if (!isEqual(search, searchParams)) {
    isNewSearch = true;
    searchParams = search;
    searchParamsSubject.next(searchParams);
  }

  return isNewPath || isNewSearch;
}

export function watchPopState() {
  const handlePopState = () => {
    handleNewLocation(window.location.pathname, getSearchParams());
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}

type NavigateParams = {
  to?: string;
  search?: SearchParams;
  replaceSearch?: boolean;
  replaceHistory?: boolean;
};

export function navigate(params: NavigateParams) {
  const { search = {}, replaceHistory = false } = params;
  const replaceSearch = params.to ? true : params.replaceSearch;
  const { origin } = window.location;

  const newSearchParams = replaceSearch
    ? search
    : {
        ...getSearchParams(),
        ...search,
      };

  const isNewLocation = handleNewLocation(params.to || window.location.pathname, newSearchParams);

  if (isNewLocation) {
    const searchString = objectToSearchString(searchParams);
    const newFullpath = pathname + (searchString ? `?${searchString}` : "");

    if (replaceHistory) {
      window.history.replaceState(null, "", origin + newFullpath);
    } else {
      window.history.pushState(null, "", origin + newFullpath);
    }

    return true;
  }

  return false;
}

export function isRouteActive(path: string) {
  return path === "/"
    ? pathname === "/"
    : checkIsChildSegments(toPathSegments(path), toPathSegments(pathname));
}

type SetSearchParamsOptions = {
  replace?: boolean;
  replaceHistory?: boolean;
};

export function setSearchParams<T extends SearchParams = SearchParams>(
  params: T | null,
  options: SetSearchParamsOptions = {}
) {
  return navigate({
    search: params || {},
    replaceSearch: params === null || options.replace,
    replaceHistory: options.replaceHistory,
  });
}

export const router = {
  navigate,
  setSearchParams,
  isRouteActive,
  subscribePathname: store.subscribePathname,
  subscribeSearchParams: store.subscribeSearchParams,
};

export type Router = typeof router;

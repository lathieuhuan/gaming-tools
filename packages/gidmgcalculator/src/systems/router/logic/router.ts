import { SearchParams } from "../types";
import {
  checkIsChildSegments,
  getSearchParams,
  objectToSearchString,
  toPathSegments,
} from "../utils";

type RouteData = {
  pathname: string;
  searchParams: SearchParams;
};

type RouterSubscriber = (route: RouteData) => void;

class InternalRouter {
  private pathname: string;
  private searchParams: SearchParams;
  private subscribers: Set<RouterSubscriber> = new Set();

  constructor() {
    this.pathname = window.location.pathname;
    this.searchParams = getSearchParams();
  }

  gen() {
    return {
      pathname: this.pathname,
      searchParams: this.searchParams,
      subscribe: this.subscribe.bind(this),
      navigate: this.navigate.bind(this),
      isRouteActive: this.isRouteActive.bind(this),
    };
  }

  subscribe(callback: RouterSubscriber) {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  notifySubscribers() {
    const data: RouteData = {
      pathname: this.pathname,
      searchParams: this.searchParams,
    };

    this.subscribers.forEach((subscriber) => subscriber(data));
  }

  watchPopState() {
    const handlePopState = () => {
      this.pathname = window.location.pathname;
      this.searchParams = getSearchParams();
      this.notifySubscribers();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }

  private _navigate(pathname: string, searchParams?: SearchParams, replaceHistory?: boolean) {
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

  navigate(pathname: string, searchParams: SearchParams = {}, replaceHistory?: boolean) {
    const { navigated } = this._navigate(pathname, searchParams, replaceHistory);

    if (navigated) {
      this.pathname = pathname;
      this.searchParams = searchParams;
      this.notifySubscribers();
    }
  }

  isRouteActive(path: string) {
    return path === "/"
      ? this.pathname === "/"
      : checkIsChildSegments(toPathSegments(path), toPathSegments(this.pathname));
  }
}

export const internalRouter = new InternalRouter();

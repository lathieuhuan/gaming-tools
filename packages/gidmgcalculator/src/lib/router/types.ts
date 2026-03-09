import type { ComponentType } from "react";

type SearchParamValue = string | number | boolean | (string | number | boolean)[];

export type SearchParams = Record<string, SearchParamValue>;

export type RouteConfig = {
  path: string;
  component: ComponentType;
  notFound?: ComponentType;
  children?: RouteConfig[];
};

export type RootRouteConfig = Omit<RouteConfig, "path">;

export type OutletRoute = {
  config: RouteConfig;
  nextSegments: string[];
};

export type NotFoundRoute = {
  component: ComponentType;
};

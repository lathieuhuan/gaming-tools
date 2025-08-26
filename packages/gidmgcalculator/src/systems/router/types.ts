import { ComponentType } from "react";

type SearchParamValue = string | number | boolean | (string | number | boolean)[];

export type SearchParams = Record<string, SearchParamValue>;

export type RouteElementProps = { searchParams?: SearchParams };

export type RouteConfig = {
  path: string;
  component: ComponentType;
  defaultChild?: Omit<RouteConfig, "path">;
  children?: RouteConfig[];
};

export type RootRouteConfig = Omit<RouteConfig, "path">;

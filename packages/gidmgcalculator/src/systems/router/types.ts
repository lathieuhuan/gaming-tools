import { ComponentType } from "react";

type SearchParamValue = string | number | boolean | (string | number | boolean)[];

export type SearchParams = Record<string, SearchParamValue>;

export type RouteElementProps = { searchParams?: SearchParams };

export type RouteConfig = {
  path: string;
  element: ComponentType<RouteElementProps>;
  children?: RouteConfig[];
};

import { RouteConfig } from "../types";
import { checkIsChildSegments, toSegments } from "../utils";

export type OutletRoute = {
  config: RouteConfig;
  nextSegments: string[];
};

export function getOutletRoute(segments: string[], childRoutes: RouteConfig[] = []): OutletRoute | null {
  for (const route of childRoutes) {
    const childSegments = toSegments(route.path);

    if (checkIsChildSegments(childSegments, segments)) {
      return {
        config: route,
        nextSegments: segments.slice(childSegments.length),
      };
    }
  }

  return null;
}

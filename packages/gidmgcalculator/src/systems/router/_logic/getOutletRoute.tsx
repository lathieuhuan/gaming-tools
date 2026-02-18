import { OutletRoute, RouteConfig } from "../_types";
import { checkIsChildSegments, toPathSegments } from "../_utils";

export function getOutletRoute(
  segments: string[],
  childRoutes: RouteConfig[] = []
): OutletRoute | null {
  for (const route of childRoutes) {
    const childSegments = toPathSegments(route.path);

    if (checkIsChildSegments(childSegments, segments)) {
      return {
        config: route,
        nextSegments: segments.slice(childSegments.length),
      };
    }
  }

  return null;
}

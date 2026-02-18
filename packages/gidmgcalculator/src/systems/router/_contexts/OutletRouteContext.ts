import { createContext } from "react";
import type { NotFoundRoute, OutletRoute } from "../_types";

export const OutletRouteContext = createContext<OutletRoute | NotFoundRoute | null>(null);

import { createContext } from "react";
import { NotFoundRoute, OutletRoute } from "../types";

export const OutletRouteContext = createContext<OutletRoute | NotFoundRoute | null>(null);

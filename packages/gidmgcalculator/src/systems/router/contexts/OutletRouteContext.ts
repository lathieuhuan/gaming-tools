import { createContext } from "react";
import { OutletRoute } from "../logic/getOutletRoute";

export const OutletRouteContext = createContext<OutletRoute | null>(null);

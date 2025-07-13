import { createContext } from "react";
import type { CalcTeamData, TeamData } from "@Calculation";

export const TeamDataContext = createContext<TeamData | undefined>(undefined);

export const CalcTeamDataContext = createContext<CalcTeamData | undefined>(undefined);

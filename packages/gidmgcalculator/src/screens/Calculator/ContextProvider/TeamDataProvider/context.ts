import { createContext, useContext } from "react";
import type { CalcTeamData, TeamData } from "@Calculation";

export const TeamDataContext = createContext<TeamData | undefined>(undefined);

export const CalcTeamDataContext = createContext<CalcTeamData | undefined>(undefined);

export function useTeamData() {
  const context = useContext(TeamDataContext);
  if (!context) {
    throw new Error("useTeamData must be used inside Calculator/ContextProvider");
  }
  return context;
}

export function useCalcTeamData() {
  const context = useContext(CalcTeamDataContext);
  if (!context) {
    throw new Error("useCalcTeamData must be used inside Calculator/ContextProvider");
  }
  return context;
}

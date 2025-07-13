import { useContext } from "react";
import { CalculatorModalsContext } from "./ModalsProvider/Modals.context";
import { CalcTeamDataContext, TeamDataContext } from "./TeamDataProvider/TeamData.context";

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

export function useCalcModalCtrl() {
  const context = useContext(CalculatorModalsContext);
  if (!context) {
    throw new Error("useCalcModalCtrl must be used inside Calculator/ContextProvider");
  }
  return context;
}

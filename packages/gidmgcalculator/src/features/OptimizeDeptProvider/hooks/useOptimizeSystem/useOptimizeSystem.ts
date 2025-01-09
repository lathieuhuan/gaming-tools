import { useContext } from "react";
import { OptimizeDeptContext } from "../../OptimizeDept.context";

export const useOptimizeSystem = () => {
  const context = useContext(OptimizeDeptContext);

  if (!context) {
    throw new Error("useOptimizeSystem must be used inside OptimizeSystemProvider");
  }
  return context;
};

import { useContext } from "react";
import { OptimizeSystemContext } from "../../OptimizeDept.context";

export const useOptimizeSystem = () => {
  const context = useContext(OptimizeSystemContext);

  if (!context) {
    throw new Error("useOptimizeSystem must be used inside OptimizeDeptProvider");
  }
  return context;
};

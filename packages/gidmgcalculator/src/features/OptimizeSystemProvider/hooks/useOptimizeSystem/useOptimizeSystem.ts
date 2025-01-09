import { useContext } from "react";
import { OptimizeSystemContext } from "../../OptimizeSystem.context";

export const useOptimizeSystem = () => {
  const context = useContext(OptimizeSystemContext);

  if (!context) {
    throw new Error("useOptimizeSystem must be used inside OptimizeSystemProvider");
  }
  return context;
};

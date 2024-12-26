import { useState } from "react";
import { OptimizationStateContext, OptimizationState, type OptimizationStatus } from "../contexts";

export function OptimizationStateProvider(props: { children: React.ReactNode }) {
  const [status, setStatus] = useState<OptimizationStatus>({
    active: false,
    loading: false,
  });

  const state: OptimizationState = {
    status,
    toggle: (key, value = !status[key]) => {
      setStatus((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
  };

  return <OptimizationStateContext.Provider value={state}>{props.children}</OptimizationStateContext.Provider>;
}

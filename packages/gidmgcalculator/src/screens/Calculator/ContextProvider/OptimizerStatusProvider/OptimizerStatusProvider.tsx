import { useState } from "react";
import { OptimizerStateContext, OptimizerState, type OptimizerStatus } from "../contexts";

export function OptimizerStatusProvider(props: { children: React.ReactNode }) {
  const [status, setStatus] = useState<OptimizerStatus>({
    active: false,
    loading: false,
  });

  const state: OptimizerState = {
    status,
    toggle: (key, value = !status[key]) => {
      setStatus((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
  };

  return <OptimizerStateContext.Provider value={state}>{props.children}</OptimizerStateContext.Provider>;
}

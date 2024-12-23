import { useState } from "react";
import { OptimizerStatusContext, OptimizerStatusContextModel, type OptimizerStatus } from "../contexts";

export function OptimizerStatusProvider(props: { children: React.ReactNode }) {
  const [status, setStatus] = useState<OptimizerStatus>({
    active: false,
  });

  const context: OptimizerStatusContextModel = {
    value: status,
    toggle: (active = !status.active) => {
      setStatus((prev) => ({
        ...prev,
        active,
      }));
    },
  };

  return <OptimizerStatusContext.Provider value={context}>{props.children}</OptimizerStatusContext.Provider>;
}

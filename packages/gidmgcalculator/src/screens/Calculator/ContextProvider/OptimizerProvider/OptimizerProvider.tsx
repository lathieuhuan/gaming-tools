import { useEffect, useRef, useState } from "react";
import { OptimizeManager } from "./optimize-manager";
import { OptimizerStateContext, OptimizerState, OptimizerStatus } from "./OptimizerState.context";

function useOptimizer() {
  const ref = useRef<OptimizeManager>();

  if (!ref.current) {
    ref.current = new OptimizeManager();
  }
  return ref.current;
}

export function OptimizerProvider(props: { children: React.ReactNode }) {
  const [status, setStatus] = useState<OptimizerStatus>({
    active: false,
    loading: false,
    testMode: false,
    result: [],
  });
  const optimizer = useOptimizer();

  useEffect(() => {
    optimizer.onStart = () => {
      setStatus((prev) => ({ ...prev, loading: true }));
    };

    const unsubscribe = optimizer.subscribeCompletion((result) => {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        result,
      }));
    });

    return () => {
      unsubscribe();
      optimizer.end();
    };
  }, []);

  const state: OptimizerState = {
    status,
    optimizer,
    toggle: (key, value = !status[key]) => {
      setStatus((prev) => ({
        ...prev,
        [key]: value,
      }));

      if (key === "testMode") {
        optimizer.switchTestMode(value);
      }
    },
  };

  return <OptimizerStateContext.Provider value={state}>{props.children}</OptimizerStateContext.Provider>;
}

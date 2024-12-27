import { useEffect, useRef, useState } from "react";
import type { OptimizerState, OptimizerStatus } from "./OptimizerProvider.types";
import { OptimizerStateContext } from "../contexts";
import { OptimizerManager } from "./optimizer-manager";

function useOptimizer() {
  const ref = useRef<OptimizerManager>();

  if (!ref.current) {
    ref.current = new OptimizerManager();
  }
  return ref.current;
}

export function OptimizerProvider(props: { children: React.ReactNode }) {
  const [status, setStatus] = useState<OptimizerStatus>({
    active: false,
    loading: false,
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
    },
  };

  return <OptimizerStateContext.Provider value={state}>{props.children}</OptimizerStateContext.Provider>;
}

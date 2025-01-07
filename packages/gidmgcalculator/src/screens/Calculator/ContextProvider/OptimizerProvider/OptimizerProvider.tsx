import { useEffect, useRef, useState } from "react";
import { OptimizerAllArtifactModConfigs } from "@Backend";
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
    pendingResult: false,
    result: [],
  });
  const lastModConfigs = useRef<OptimizerAllArtifactModConfigs>();
  const optimizer = useOptimizer();

  useEffect(() => {
    optimizer.onStart = () => {
      setStatus((prev) => ({
        ...prev,
        loading: true,
        pendingResult: false,
        result: [],
      }));
    };

    const unsubscribe = optimizer.subscribeCompletion((result) => {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        pendingResult: prev.active ? prev.pendingResult : true,
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
    open: (setup, testMode = false) => {
      setStatus((prev) => ({
        ...prev,
        active: true,
        testMode,
        setup: setup ?? prev.setup,
      }));

      optimizer.switchTestMode(testMode);
    },
    close: (shouldKeepResult) => {
      setStatus((prev) => ({
        ...prev,
        active: false,
        pendingResult: shouldKeepResult,
        setup: shouldKeepResult ? prev.setup : undefined,
        result: shouldKeepResult ? prev.result : [],
      }));
    },
    setLoading: (loading) => {
      setStatus((prev) => ({
        ...prev,
        loading,
      }));
    },
  };

  return <OptimizerStateContext.Provider value={state}>{props.children}</OptimizerStateContext.Provider>;
}

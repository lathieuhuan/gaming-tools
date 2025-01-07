import { useEffect, useRef, useState } from "react";
import { OptimizerAllArtifactModConfigs } from "@Backend";
import { OptimizeManager } from "./optimize-manager";
import { OptimizeDirectorContext, OptimizeDirector, OptimizeDirectorState } from "./OptimizeDirector.context";

function useOptimizer() {
  const ref = useRef<OptimizeManager>();

  if (!ref.current) {
    ref.current = new OptimizeManager();
  }
  return ref.current;
}

export function OptimizeDirectorProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState<OptimizeDirectorState>({
    active: false,
    optimizerStatus: "IDLE",
    testMode: false,
    pendingResult: false,
    result: [],
  });
  const lastModConfigs = useRef<OptimizerAllArtifactModConfigs>();
  const optimizer = useOptimizer();

  useEffect(() => {
    optimizer.onStart = () => {
      setState((prev) => ({
        ...prev,
        optimizerStatus: "WORKING",
        pendingResult: false,
        result: [],
      }));
    };

    const unsubscribe = optimizer.subscribeCompletion((result) => {
      setState((prev) => ({
        ...prev,
        optimizerStatus: "IDLE",
        pendingResult: prev.active ? prev.pendingResult : true,
        result,
      }));
    });

    return () => {
      unsubscribe();
      optimizer.end();
    };
  }, []);

  const context: OptimizeDirector = {
    state,
    optimizer,
    open: (setup, testMode = false) => {
      setState((prev) => ({
        ...prev,
        active: true,
        testMode,
        setup: setup ?? prev.setup,
      }));

      optimizer.switchTestMode(testMode);
    },
    close: (shouldKeepResult) => {
      setState((prev) => ({
        ...prev,
        active: false,
        pendingResult: shouldKeepResult,
        setup: shouldKeepResult ? prev.setup : undefined,
        result: shouldKeepResult ? prev.result : [],
      }));
    },
    cancel: () => {
      optimizer.end();
      setState((prev) => ({
        ...prev,
        optimizerStatus: "CANCELLED",
      }));
    },
    // setLoading: (loading) => {
    //   setState((prev) => ({
    //     ...prev,
    //     loading,
    //   }));
    // },
  };

  return <OptimizeDirectorContext.Provider value={context}>{props.children}</OptimizeDirectorContext.Provider>;
}

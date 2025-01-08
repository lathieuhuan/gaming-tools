import { useEffect, useRef, useState } from "react";

import Object_ from "@Src/utils/object-utils";
import { OptimizeManager } from "./optimize-manager";
import { OptimizeSystem, OptimizeSystemContext, OptimizeSystemState } from "./OptimizeSystem.context";

function useOptimizer() {
  const ref = useRef<OptimizeManager>();

  if (!ref.current) {
    ref.current = new OptimizeManager();
  }
  return ref.current;
}

const DEFAULT_STATE = {
  result: [],
  setup: undefined,
  artifactModConfigs: {
    buffs: {},
    debuffs: {},
  },
} satisfies Pick<OptimizeSystemState, "setup" | "artifactModConfigs" | "result">;

export function OptimizeSystemProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState<OptimizeSystemState>({
    active: false,
    status: "IDLE",
    testMode: false,
    pendingResult: false,
    ...DEFAULT_STATE,
  });
  const optimizer = useOptimizer();

  useEffect(() => {
    // optimizer.onStart = (_, modConfigs) => {
    //   setState((prev) => ({
    //     ...prev,
    //     optimizerStatus: "WORKING",
    //     pendingResult: false,
    //     result: [],
    //     artifactModConfigs: Object_.clone(modConfigs),
    //   }));
    // };

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

  const context: OptimizeSystem = {
    state,
    openDept: (setup, testMode = false) => {
      setState((prev) => ({
        ...prev,
        active: true,
        testMode,
        setup: setup ?? prev.setup,
      }));

      optimizer.switchTestMode(testMode);
    },
    closeDept: (shouldKeepResult) => {
      setState((prev) => {
        const newState: OptimizeSystemState = {
          ...prev,
          active: false,
          pendingResult: shouldKeepResult,
        };

        return shouldKeepResult ? newState : Object.assign(newState, DEFAULT_STATE);
      });
    },
    optimizer: {
      init: optimizer.init,
      load: optimizer.load,
      optimize: (calcItemParams, modConfigs, extraConfigs) => {
        setState((prev) => ({
          ...prev,
          optimizerStatus: "WORKING",
          pendingResult: false,
          result: [],
          artifactModConfigs: Object_.clone(modConfigs),
        }));

        optimizer.optimize(calcItemParams, modConfigs, extraConfigs);
      },
      end: optimizer.end,
      subscribeCompletion: optimizer.subscribeCompletion,
      subscribeProcess: optimizer.subscribeProcess,
    },
    cancelProcess: () => {
      optimizer.end();
      setState((prev) => ({
        ...prev,
        optimizerStatus: "CANCELLED",
      }));
    },
  };

  return <OptimizeSystemContext.Provider value={context}>{props.children}</OptimizeSystemContext.Provider>;
}

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
    const unsubscribe = optimizer.subscribeCompletion((result) => {
      setState((prev) => {
        const newState: OptimizeSystemState = {
          ...prev,
          status: "IDLE",
          pendingResult: prev.active ? prev.pendingResult : true,
          result,
        };
        return newState;
      });
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
      init: (...params) => {
        optimizer.init(...params);
      },
      load: (...params) => {
        optimizer.load(...params);
      },
      optimize: (calcItemParams, modConfigs, extraConfigs) => {
        setState((prev) => {
          const newState: OptimizeSystemState = {
            ...prev,
            status: "WORKING",
            pendingResult: false,
            result: [],
            artifactModConfigs: Object_.clone(modConfigs),
          };
          return newState;
        });

        optimizer.optimize(calcItemParams, modConfigs, extraConfigs);
      },
      end: () => {
        optimizer.end();
      },
      subscribeCompletion: (subscriber) => {
        return optimizer.subscribeCompletion(subscriber);
      },
      subscribeProcess: (subscriber) => {
        return optimizer.subscribeProcess(subscriber);
      },
    },
    cancelProcess: () => {
      optimizer.end();
      setState((prev) => {
        const newState: OptimizeSystemState = {
          ...prev,
          status: "CANCELLED",
        };
        return newState;
      });
    },
  };

  return <OptimizeSystemContext.Provider value={context}>{props.children}</OptimizeSystemContext.Provider>;
}

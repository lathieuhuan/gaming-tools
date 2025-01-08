import { useEffect, useRef, useState } from "react";

import Object_ from "@Src/utils/object-utils";
import { OptimizeManager } from "./optimize-manager";
import { OptimizeDirector, OptimizeDirectorContext, OptimizeDirectorState } from "./OptimizeDirector.context";

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
} satisfies Pick<OptimizeDirectorState, "setup" | "artifactModConfigs" | "result">;

export function OptimizeDirectorProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState<OptimizeDirectorState>({
    active: false,
    optimizerStatus: "IDLE",
    testMode: false,
    pendingResult: false,
    ...DEFAULT_STATE,
  });
  const optimizer = useOptimizer();

  useEffect(() => {
    optimizer.onStart = (_, modConfigs) => {
      setState((prev) => ({
        ...prev,
        optimizerStatus: "WORKING",
        pendingResult: false,
        result: [],
        artifactModConfigs: Object_.clone(modConfigs),
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
      setState((prev) => {
        const newState: OptimizeDirectorState = {
          ...prev,
          active: false,
          pendingResult: shouldKeepResult,
        };

        return shouldKeepResult ? newState : Object.assign(newState, DEFAULT_STATE);
      });
    },
    cancel: () => {
      optimizer.end();
      setState((prev) => ({
        ...prev,
        optimizerStatus: "CANCELLED",
      }));
    },
  };

  return <OptimizeDirectorContext.Provider value={context}>{props.children}</OptimizeDirectorContext.Provider>;
}

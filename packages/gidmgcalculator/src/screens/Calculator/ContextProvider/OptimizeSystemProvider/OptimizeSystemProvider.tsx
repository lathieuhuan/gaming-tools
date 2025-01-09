import { useEffect, useRef, useState } from "react";
import { Modal } from "rond";

import Object_ from "@Src/utils/object-utils";
import { OptimizeManager } from "./optimize-manager";
import { OptimizeSystem, OptimizeSystemContext, OptimizeSystemState } from "./OptimizeSystem.context";
import { OptimizeIntro, type OptimizeIntroProps } from "./components";

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
  recreationData: {},
} satisfies Pick<OptimizeSystemState, "setup" | "artifactModConfigs" | "result" | "recreationData">;

export function OptimizeSystemProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState<OptimizeSystemState>({
    introducing: false,
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
    onContacted: () => {
      setState((prev) => {
        const newState = { ...prev };

        if (prev.status === "OPTIMIZING" || state.result.length) {
          newState.active = true;
        } else {
          newState.introducing = true;
        }
        return newState;
      });
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
      init: (target, setup, data) => {
        optimizer.init(target, setup, data);
      },
      load: (...params) => {
        optimizer.load(...params);
      },
      optimize: (calcItemParams, modConfigs, extraConfigs) => {
        setState((prev) => {
          const newState: OptimizeSystemState = {
            ...prev,
            status: "OPTIMIZING",
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

  const closeIntro = () => {
    setState((prev) => ({
      ...prev,
      introducing: false,
    }));
  };

  const startNewOptimization: OptimizeIntroProps["onSubmit"] = (setup, _, testMode) => {
    setState((prev) => ({
      ...prev,
      active: true,
      testMode,
      setup,
    }));

    optimizer.switchTestMode(testMode);
    closeIntro();
  };

  return (
    <OptimizeSystemContext.Provider value={context}>
      {props.children}

      <Modal
        active={state.introducing}
        title="Optimizer"
        preset="small"
        // centered={false}
        className="bg-surface-2"
        // style={{
        //   top: "min(20%, 5rem)",
        // }}
        withActions
        confirmButtonProps={{
          form: OptimizeIntro.FORM_ID,
          type: "submit",
          children: "Proceed",
          autoFocus: true,
        }}
        onClose={closeIntro}
      >
        <OptimizeIntro onSubmit={startNewOptimization} />
      </Modal>
    </OptimizeSystemContext.Provider>
  );
}

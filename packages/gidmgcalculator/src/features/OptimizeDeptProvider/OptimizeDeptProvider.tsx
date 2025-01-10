import { useEffect, useState } from "react";
import { Modal } from "rond";

import type { OptimizeDeptState } from "./OptimizeDept.types";

import Object_ from "@Src/utils/object-utils";
import { OptimizeSystemContext, OptimizeSystem } from "./OptimizeDept.context";
import { useOptimizerManager } from "./hooks/useOptimizeManager";

// Components
import { OptimizeIntro, FrontDesk, OptimizerOffice, type OptimizeIntroProps, type FrontDeskProps } from "./components";

const DEFAULT_STATE = {
  result: [],
  setup: undefined,
  artifactModConfigs: {
    buffs: {},
    debuffs: {},
  },
  recreationData: {},
  calcList: {
    NA: [],
    CA: [],
    PA: [],
    ES: [],
    EB: [],
  },
  runCount: 0,
} satisfies Pick<
  OptimizeDeptState,
  "setup" | "artifactModConfigs" | "result" | "recreationData" | "calcList" | "runCount"
>;

export function OptimizeDeptProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState<OptimizeDeptState>({
    introducing: false,
    active: false,
    status: "IDLE",
    testMode: false,
    pendingResult: false,
    ...DEFAULT_STATE,
  });
  const [activeOffice, setActiveOffice] = useState(false);
  const manager = useOptimizerManager();

  useEffect(() => {
    const unsubscribe = manager.subscribeCompletion((result) => {
      setState((prev) => {
        const newState: OptimizeDeptState = {
          ...prev,
          status: "IDLE",
          pendingResult: prev.active ? prev.pendingResult : true,
          result,
          runCount: prev.runCount + 1,
        };
        return newState;
      });
    });

    return () => {
      unsubscribe();
      manager.end();
    };
  }, []);

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

    manager.switchTestMode(testMode);
    closeIntro();
  };

  const closeDept = (shouldKeepResult: boolean) => {
    setState((prev) => {
      const newState: OptimizeDeptState = {
        ...prev,
        active: false,
        pendingResult: shouldKeepResult,
      };
      return shouldKeepResult ? newState : Object.assign(newState, DEFAULT_STATE);
    });

    setActiveOffice(false);
  };

  const optimizer: FrontDeskProps["optimizer"] = {
    init: (target, setup, data) => {
      setState((prev) => {
        const newState: OptimizeDeptState = {
          ...prev,
          status: "IDLE",
          calcList: data.appCharacters[setup.char.name]?.calcList || DEFAULT_STATE.calcList,
          recreationData: {
            target,
          },
        };
        return newState;
      });

      manager.init(target, setup, data);
    },
    load: manager.load,
    optimize: (calcItemParams, modConfigs, extraConfigs) => {
      setState((prev) => {
        const newState: OptimizeDeptState = {
          ...prev,
          status: "OPTIMIZING",
          pendingResult: false,
          result: [],
          artifactModConfigs: Object_.clone(modConfigs),
        };
        return newState;
      });

      manager.optimize(calcItemParams, modConfigs, extraConfigs);
    },
  };

  const system: OptimizeSystem = {
    state,
    contact: () => {
      setState((prev) => {
        const newState = { ...prev };

        if (prev.status === "OPTIMIZING" || state.result.length) {
          newState.active = true;
          setActiveOffice(true);
        } else {
          newState.introducing = true;
        }
        return newState;
      });
    },
    subscribeProcess: (subscriber) => {
      return manager.subscribeProcess(subscriber);
    },
    cancelProcess: () => {
      manager.end();

      setState((prev) => {
        const newState: OptimizeDeptState = {
          ...prev,
          status: "CANCELLED",
        };
        return newState;
      });
    },
  };

  console.log(state);

  return (
    <OptimizeSystemContext.Provider value={system}>
      {props.children}

      <Modal
        active={state.introducing}
        title="Optimizer"
        preset="small"
        className="bg-surface-2"
        // centered={false}
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

      {state.active && (
        <OptimizerOffice
          active={activeOffice}
          closeDeptAfterCloseOffice
          onRequestClose={() => setActiveOffice(false)}
          onCloseDept={closeDept}
        />
      )}

      {state.active && !state.pendingResult && (
        <FrontDesk state={state} optimizer={optimizer} onCloseDept={closeDept} />
      )}
    </OptimizeSystemContext.Provider>
  );
}

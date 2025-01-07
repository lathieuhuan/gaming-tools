import { useEffect, useState } from "react";
import { useOptimizerState } from "../ContextProvider";

// Components
import { ResultDisplay } from "./components/ResultDisplay";
import { OptimizationFrontDesk } from "./FrontDesk";

export function OptimizationDept() {
  const state = useOptimizerState();
  const [activeResult, setActiveResult] = useState(false);

  const { status } = state;
  const externalActiveResult = status.pendingResult && status.result.length !== 0;

  useEffect(() => {
    if (externalActiveResult !== activeResult) {
      setActiveResult(externalActiveResult);
    }
  }, [status.active, externalActiveResult]);

  if (status.active) {
    return (
      <>
        <ResultDisplay active={activeResult} onClose={() => setActiveResult(false)} afterClose={state.close} />

        {!externalActiveResult && <OptimizationFrontDesk state={state} />}
      </>
    );
  }

  return null;
}

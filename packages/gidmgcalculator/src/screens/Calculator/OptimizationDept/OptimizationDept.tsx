import { useEffect, useState } from "react";
import { useOptimizerState } from "../ContextProvider";

// Components
import { OptimizerOffice } from "./components/OptimizerOffice";
import { OptimizationFrontDesk } from "./FrontDesk";

export function OptimizationDept() {
  const state = useOptimizerState();
  const [activeOffice, setActiveResult] = useState(false);

  const { status } = state;
  const activeOfficeExpect = status.pendingResult;

  useEffect(() => {
    if (activeOfficeExpect !== activeOffice) {
      setActiveResult(activeOfficeExpect);
    }
  }, [status.active, activeOfficeExpect]);

  console.log(status);

  if (status.active) {
    return (
      <>
        <OptimizerOffice
          active={activeOffice}
          optimizerState={state}
          closeDeptAfterCloseOffice
          onClose={() => setActiveResult(false)}
        />

        {!activeOfficeExpect && <OptimizationFrontDesk state={state} />}
      </>
    );
  }

  return null;
}

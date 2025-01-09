import { useEffect, useState } from "react";
import { useOptimizeSystem } from "@Src/features";

// Components

export function OptimizeDept() {
  const system = useOptimizeSystem();
  const [activeOffice, setActiveOffice] = useState(false);

  const { state } = system;
  const activeOfficeExpect = state.pendingResult;

  useEffect(() => {
    if (activeOfficeExpect !== activeOffice) {
      setActiveOffice(activeOfficeExpect);
    }
  }, [state.active, activeOfficeExpect]);

  console.log(state);

  if (state.active) {
    return (
      <>
        <OptimizerOffice
          active={activeOffice}
          system={system}
          closeDeptAfterCloseOffice
          onClose={() => setActiveOffice(false)}
        />

        {!activeOfficeExpect && <FrontDesk system={system} />}
      </>
    );
  }

  return null;
}

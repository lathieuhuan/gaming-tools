import { useEffect, useState } from "react";
import { useOptimizeDirector } from "../ContextProvider";

// Components
import { OptimizerOffice } from "./components/OptimizerOffice";
import { OptimizationFrontDesk } from "./FrontDesk";

export function OptimizationDept() {
  const director = useOptimizeDirector();
  const [activeOffice, setActiveOffice] = useState(false);

  const { state } = director;
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
          director={director}
          closeDeptAfterCloseOffice
          onClose={() => setActiveOffice(false)}
        />

        {!activeOfficeExpect && <OptimizationFrontDesk director={director} />}
      </>
    );
  }

  return null;
}

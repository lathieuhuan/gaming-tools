import { TrashCanSvg } from "rond";
import { useOptimizerState } from "../ContextProvider";
import { ResultDisplay, ResultModalCase } from "./components/ResultDisplay";

// Components
import { OptimizationFrontDesk } from "./FrontDesk";

export function OptimizationDept() {
  const state = useOptimizerState();
  const { status } = state;

  if (status.active) {
    if (status.pendingResult && status.result.length) {
      return (
        <ResultModalCase active>
          <ResultDisplay
            moreActions={[
              {
                children: "Discard",
                icon: <TrashCanSvg />,
                onClick: () => state.close(false),
              },
            ]}
          />
        </ResultModalCase>
      );
    }
    return <OptimizationFrontDesk state={state} />;
  }

  return null;
}

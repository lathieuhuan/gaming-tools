import { useOptimizerState } from "../ContextProvider";

// Components
import { OptimizationFrontDesk } from "./FrontDesk";

export function OptimizationDept() {
  const state = useOptimizerState();

  if (state.status.active) {
    return <OptimizationFrontDesk state={state} />;
  }

  return null;
}

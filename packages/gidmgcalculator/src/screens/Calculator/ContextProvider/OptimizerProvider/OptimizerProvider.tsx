import { useRef } from "react";
import { OptimizerManager } from "../utils/optimizer-manager";
import { OptimizerContext } from "../contexts";

const useOptimizer = () => {
  const ref = useRef<OptimizerManager>();

  if (!ref.current) {
    ref.current = new OptimizerManager();
  }
  return ref.current;
};

export function OptimizerProvider(props: { children: React.ReactNode }) {
  return <OptimizerContext.Provider value={useOptimizer()}>{props.children}</OptimizerContext.Provider>;
}

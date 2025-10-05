import { FaSun } from "react-icons/fa";
import { clsx } from "rond";

import { useOptimizeSystem } from "@/systems/optimize-dept";

export function OptimizerButton() {
  const { state, contact } = useOptimizeSystem();

  if (state.pendingResult) {
    return (
      <button className="w-8 h-8 flex-center bg-dark-3 glow-on-hover" onClick={contact}>
        <FaSun
          className={clsx(
            "text-lg",
            !state.active
              ? state.status === "OPTIMIZING"
                ? "animate-spin"
                : state.result.length
                ? "text-danger-2"
                : null
              : null
          )}
        />
      </button>
    );
  }

  return null;
}

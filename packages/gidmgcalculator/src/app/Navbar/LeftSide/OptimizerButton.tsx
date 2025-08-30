import { FaSun } from "react-icons/fa";
import { clsx } from "rond";

import { useOptimizeSystem } from "@/features";

export function OptimizerButton() {
  const { state, contact } = useOptimizeSystem();

  if (state.pendingResult) {
    return (
      <button className="w-8 h-8 flex-center bg-surface-3 glow-on-hover" onClick={contact}>
        <FaSun
          className={clsx(
            "text-lg",
            !state.active
              ? state.status === "OPTIMIZING"
                ? "animate-spin"
                : state.result.length
                ? "text-danger-3"
                : null
              : null
          )}
        />
      </button>
    );
  }

  return null;
}

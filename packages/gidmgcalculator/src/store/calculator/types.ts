import type { CalcSetup, Target } from "@/models";
import type { SetupManager } from "@/types";

export type CalculatorState = {
  activeId: number;
  standardId: number;
  comparedIds: number[];
  setupManagers: SetupManager[];
  setupsById: Record<string, CalcSetup>;
  target: Target;
};

export type ForwardedAction<T extends (...args: any[]) => void> = (...args: Parameters<T>) => void;

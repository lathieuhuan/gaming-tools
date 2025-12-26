import type { Target } from "@/models/base";
import type { CalcSetup } from "@/models/calculator";
import type { ISetupManager } from "@/types";

export type CalculatorState = {
  activeId: number;
  standardId: number;
  comparedIds: number[];
  setupManagers: ISetupManager[];
  setupsById: Record<string, CalcSetup>;
  target: Target;
};

export type ForwardedAction<T extends (...args: any[]) => void> = (...args: Parameters<T>) => void;

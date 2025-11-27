import type { CalcSetup, MainTarget } from "@/models/calculator";
import type { SetupType } from "@/types";

export type CalcSetupManager = {
  ID: number;
  type: SetupType;
  name: string;
};

export type CalculatorState = {
  activeId: number;
  standardId: number;
  comparedIds: number[];
  setupManagers: CalcSetupManager[];
  setupsById: Record<string, CalcSetup>;
  target: MainTarget;
};

export type ForwardedAction<T extends (...args: any[]) => void> = (...args: Parameters<T>) => void;

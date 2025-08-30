export type StepStatus = "VALID" | "INVALID";

export type Notify<T> = (message: null | string | { message: string; toStep: T }) => void;

export type OnStepChange<T extends string> = (
  newKey: T,
  oldKey: T,
  operation: {
    changeValid: (index: number, valid: boolean) => void;
    notify: Notify<T>;
  }
) => void;

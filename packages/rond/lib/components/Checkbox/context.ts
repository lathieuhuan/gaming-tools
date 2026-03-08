import { createContext, useContext } from "react";

import { CheckboxGroupControl, CheckboxGroupOptionValue } from "./logic";

export const CheckboxGroupContext = createContext<CheckboxGroupControl<CheckboxGroupOptionValue> | null>(
  null
);

export function useCheckboxGroupContext<T extends CheckboxGroupOptionValue>() {
  const context = useContext(CheckboxGroupContext);
  if (!context) {
    throw new Error("useCheckboxGroupContext must be used within a CheckboxGroupContext");
  }
  return context as unknown as CheckboxGroupControl<T>;
}

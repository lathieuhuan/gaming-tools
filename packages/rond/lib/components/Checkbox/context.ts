import { createContext, useContext } from "react";

import { CheckboxGroupControl, CheckboxGroupValue } from "./logic";

export const CheckboxGroupContext = createContext<CheckboxGroupControl<CheckboxGroupValue> | null>(
  null
);

export function useCheckboxGroupContext<T extends CheckboxGroupValue>() {
  const context = useContext(CheckboxGroupContext);
  if (!context) {
    throw new Error("useCheckboxGroupContext must be used within a CheckboxGroupContext");
  }
  return context as unknown as CheckboxGroupControl<T>;
}

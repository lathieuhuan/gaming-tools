import type { ReactElement } from "react";

type Value = string | number;

export type MatchCase<TValue extends Value> = {
  value: TValue | TValue[];
  render: ReactElement | (() => ReactElement | null);
};

export type MatchProps<TValue extends Value> = {
  value: TValue;
  cases: MatchCase<NoInfer<TValue>>[];
  default?: ReactElement;
};

export function Match<TValue extends Value>({
  cases,
  value: valueProp,
  default: defaultEl,
}: MatchProps<TValue>) {
  for (const { value, render } of cases) {
    const correct = Array.isArray(value) ? value.includes(valueProp) : value === valueProp;

    if (!correct) {
      continue;
    }

    if (typeof render === "function") {
      return render() ?? defaultEl;
    }

    return render;
  }

  return defaultEl;
}

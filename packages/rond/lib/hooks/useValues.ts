import { useState } from "react";

export type UseValuesInitial<T> = T | T[] | null;

export type UseValuesOptions<T> = {
  initial?: UseValuesInitial<T>;
  multiple?: boolean;
  required?: boolean;
  onChange?: (values: T[]) => void;
};

export function useValues<T>(options: UseValuesOptions<T> = {}) {
  const { initial, multiple, required, onChange } = options;

  const [values, setValues] = useState<T[]>(
    initial ? (Array.isArray(initial) ? initial : [initial]) : []
  );

  const update = (newValues: T[]) => {
    if (!required || newValues.length) {
      setValues(newValues);
      onChange?.(newValues);
    }
  };

  const toggle = (value: T) => {
    const newValues = multiple
      ? values.includes(value)
        ? values.filter((type) => type !== value)
        : values.concat(value)
      : [value];

    update(newValues);
  };

  return {
    values,
    toggle,
    update,
  };
}

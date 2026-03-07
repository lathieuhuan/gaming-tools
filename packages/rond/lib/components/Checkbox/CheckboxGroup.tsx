import { MutableRefObject, useLayoutEffect } from "react";

import { useClassInstance } from "@lib/hooks/useClassInstance";
import { CheckboxItem, CheckboxItemProps } from "./CheckboxItem";
import { CheckboxGroupContext } from "./context";
import {
  CheckboxGroupControl,
  CheckboxGroupControlOptions,
  CheckboxGroupOption,
  CheckboxGroupValue,
} from "./logic";

type CheckboxGroupProps<T extends CheckboxGroupValue> = CheckboxGroupControlOptions<T> & {
  className?: string;
  style?: React.CSSProperties;
  values?: T[];
  options: CheckboxGroupOption<T>[];
  control?: MutableRefObject<CheckboxGroupControl<T> | null>;
  renderLabel?: CheckboxItemProps<T>["renderLabel"];
};

export function CheckboxGroup<T extends CheckboxGroupValue>({
  values,
  options,
  control: controlProp,
  onChange,
  renderLabel,
  ...rest
}: CheckboxGroupProps<T>) {
  const controlOptions: CheckboxGroupControlOptions<T> = {
    onChange,
  };

  const control = useClassInstance(CheckboxGroupControl, [values, controlOptions], controlProp);

  control.options = controlOptions;

  useLayoutEffect(() => {
    control.syncValues(values);
  }, [values]);

  return (
    <CheckboxGroupContext.Provider
      value={control as unknown as CheckboxGroupControl<CheckboxGroupValue>}
    >
      <div {...rest}>
        {options.map((option) => (
          <CheckboxItem key={option.value} option={option} renderLabel={renderLabel} />
        ))}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

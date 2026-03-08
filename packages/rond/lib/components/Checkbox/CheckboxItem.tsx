import { useLayoutEffect, useState } from "react";

import { Checkbox } from "./Checkbox";
import { useCheckboxGroupContext } from "./context";
import { CheckboxGroupOption, CheckboxGroupOptionValue } from "./logic";

export type CheckboxItemProps<T extends CheckboxGroupOptionValue> = {
  option: CheckboxGroupOption<T>;
  renderLabel?: (
    field: { checked: boolean; onClick: () => void },
    option: CheckboxGroupOption<T>
  ) => React.ReactElement;
};

export function CheckboxItem<T extends CheckboxGroupOptionValue>({
  option,
  renderLabel,
}: CheckboxItemProps<T>) {
  const { value, label } = option;

  const control = useCheckboxGroupContext<T>();
  const [checked, setChecked] = useState(control.values.has(value));

  useLayoutEffect(() => {
    return control.subscribe(value, (checked) => {
      setChecked(checked);
    });
  }, [value, control]);

  if (renderLabel) {
    return renderLabel({ checked, onClick: () => control.toggle(value) }, option);
  }

  return (
    <Checkbox checked={checked} onChange={() => control.toggle(value)}>
      {label}
    </Checkbox>
  );
}

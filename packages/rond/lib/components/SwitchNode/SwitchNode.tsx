type Value = string | number;

export type SwitchNodeCase<TValue> = {
  value: TValue;
  element: React.ReactNode;
};

export interface SwitchNodeProps<TValue extends Value> {
  value: TValue;
  cases: SwitchNodeCase<TValue | TValue[]>[];
  default?: React.ReactNode;
}
export function SwitchNode<TValue extends Value>(props: SwitchNodeProps<TValue>): React.ReactElement {
  return (
    <>
      {props.cases.find(({ value }) => {
        const values = Array.isArray(value) ? value : [value];
        return values.includes(props.value);
      })?.element ?? props.default}
    </>
  );
}

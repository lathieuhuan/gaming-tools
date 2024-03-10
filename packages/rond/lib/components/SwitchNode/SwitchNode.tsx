type Case<T> = {
  value: T;
  element: React.ReactNode;
};
export interface SwitchNodeProps<T extends string | number> {
  value: T;
  cases: Case<T>[];
  default?: React.ReactNode;
}
export function SwitchNode<T extends string | number>(props: SwitchNodeProps<T>): React.ReactElement {
  return <>{props.cases.find((item) => item.value === props.value)?.element ?? props.default}</>;
}

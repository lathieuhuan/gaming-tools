import type { ReactElement, ReactNode } from "react";
import type { CheckboxProps, InputNumberProps, SelectProps } from "rond";

type CheckboxControlProps = {
  type: "CHECK";
  controlProps: CheckboxProps;
};

type SelectControlProps = {
  type: "SELECT";
  controlProps: SelectProps;
};

type InputControlProps = {
  type: "INPUT";
  controlProps: InputNumberProps;
};

type CustomControlProps = {
  type: "CUSTOM";
  control: ReactElement;
};

export type SettingControlProps = (
  | CheckboxControlProps
  | SelectControlProps
  | InputControlProps
  | CustomControlProps
) & {
  label: ReactNode;
  /** Only on CHECK type */
  align?: "left" | "right";
  description?: string[];
};

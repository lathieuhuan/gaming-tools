import { ReactNode } from "react";
import { CheckboxProps, InputNumberProps, SelectProps } from "rond";

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

export type SettingControlProps = (
  | CheckboxControlProps
  | SelectControlProps
  | InputControlProps
) & {
  label: ReactNode;
  /** Only on SELECT type */
  subType?: "LEVEL";
  /** Only on CHECK type */
  align?: "left" | "right";
  description?: string[];
};

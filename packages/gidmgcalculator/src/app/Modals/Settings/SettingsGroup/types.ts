import { ReactNode } from "react";
import { CheckboxProps, InputNumberProps, SelectProps } from "rond";

type CheckboxControlProps = CheckboxProps & {
  type: "CHECK";
};

type SelectControlProps = SelectProps & {
  type: "SELECT";
};

type InputControlProps = InputNumberProps & {
  type: "INPUT";
};

export type SettingControlProps = (CheckboxControlProps | SelectControlProps | InputControlProps) & {
  label: ReactNode;
  /** Only on SELECT type */
  subType?: "LEVEL";
  /** Only on CHECK type */
  align?: "left" | "right";
  description?: string[];
};

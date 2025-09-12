import { ReactNode } from "react";
import { CheckboxProps, InputNumberProps, SelectProps } from "rond";

type CheckboxControlProps = CheckboxProps & {
  type: "CHECK";
};

type SelectControlProps = SelectProps & {
  type: "SELECT";
  subType?: "LEVEL";
};

type InputControlProps = InputNumberProps & {
  type: "INPUT";
};

export type SettingControlProps = (CheckboxControlProps | SelectControlProps | InputControlProps) & {
  label: ReactNode;
  description?: string[];
};

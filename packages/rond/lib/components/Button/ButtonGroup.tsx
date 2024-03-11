import clsx, { type ClassValue } from "clsx";
import { Button, type ButtonProps } from "./Button";
import "./ButtonGroup.styles.scss";

type Justify = "start" | "center" | "end";
type Space = "default" | "wide";

export type ButtonGroupItem = ButtonProps;

export interface ButtonGroupProps {
  className?: ClassValue;
  /** Default to 'center' */
  justify?: Justify;
  buttons: ButtonGroupItem[];
  /** Default to 'default' (12px) */
  space?: Space;
}
export function ButtonGroup({ className, justify = "center", buttons }: ButtonGroupProps) {
  return (
    <div className={clsx(`ron-button-group ron-button-group-${justify}`, className)}>
      {buttons.map(({ className, ...others }, i) => {
        return <Button key={i} className={clsx("ron-button-focus-shadow", className)} {...others} />;
      })}
    </div>
  );
}

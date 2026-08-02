import { ComponentProps } from "react";
import { clsx } from "rond";

type TextProps = ComponentProps<"span"> & { bold?: boolean };

export function PositiveText({ className, bold, ...rest }: TextProps) {
  return <span className={clsx("text-bonus", bold && "font-bold", className)} {...rest} />;
}

export function HighlightText({ className, bold, ...rest }: TextProps) {
  return <span className={clsx("text-primary-1", bold && "font-bold", className)} {...rest} />;
}

export function HintText({ className, bold, ...rest }: TextProps) {
  return <span className={clsx("text-light-hint", bold && "font-bold", className)} {...rest} />;
}

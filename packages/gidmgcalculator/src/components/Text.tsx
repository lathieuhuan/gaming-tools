import { ComponentProps } from "react";
import { clsx } from "rond";

export function PositiveText({
  className,
  bold,
  ...rest
}: ComponentProps<"span"> & { bold?: boolean }) {
  return <span className={clsx("text-bonus", bold && "font-bold", className)} {...rest} />;
}

export function HintText({
  className,
  bold,
  ...rest
}: ComponentProps<"span"> & { bold?: boolean }) {
  return <span className={clsx("text-light-hint", bold && "font-bold", className)} {...rest} />;
}

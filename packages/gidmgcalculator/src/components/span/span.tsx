import clsx from "clsx";
import type { HTMLAttributes } from "react";

type SpanExtraColor = "green-300" | "red-100" | "yellow-400" | "light-800";

interface SpanProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
  b?: boolean;
}
const makeSpan = (color: `text-${SpanExtraColor}`) => {
  return ({ className, b, ...rest }: SpanProps) => (
    <span className={clsx(color, b && "font-bold", className)} {...rest} />
  );
};

export const Green = makeSpan("text-green-300");
export const Red = makeSpan("text-red-100");
export const Yellow = makeSpan("text-yellow-400");
export const Dim = makeSpan("text-light-800");

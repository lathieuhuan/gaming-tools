import { clsx } from "rond";

type SpanExtraColor = "bonus-color" | "danger-3" | "primary-1" | "hint-color";

interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  b?: boolean;
}
const makeSpan = (color: `text-${SpanExtraColor}`) => {
  return ({ className, b, ...rest }: SpanProps) => (
    <span className={clsx(color, b && "font-bold", className)} {...rest} />
  );
};

export const Green = makeSpan("text-bonus-color");
export const Red = makeSpan("text-danger-3");
export const Yellow = makeSpan("text-primary-1");
export const Dim = makeSpan("text-hint-color");

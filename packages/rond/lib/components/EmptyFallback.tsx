import { cn } from "@lib/utils";
import type { ClassValue } from "clsx";
import type { ComponentProps } from "react";

type EmptyFallbackProps = ComponentProps<"div"> & {
  className?: ClassValue;
  containerProps?: Omit<ComponentProps<"div">, "children">;
  messageProps?: Omit<ComponentProps<"p">, "children">;
  message: string;
};

export function EmptyFallback({
  className,
  message,
  children,
  containerProps,
  messageProps,
  ...restProps
}: EmptyFallbackProps) {
  return (
    <div {...containerProps}>
      <div className={cn("peer", className)} {...restProps}>
        {children}
      </div>
      <p
        {...messageProps}
        className={cn(
          "py-4 text-center text-light-hint hidden peer-empty:block",
          messageProps?.className,
        )}
      >
        {message}
      </p>
    </div>
  );
}

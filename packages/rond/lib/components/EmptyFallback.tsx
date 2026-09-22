import { cn } from "@lib/utils";
import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";

type EmptyFallbackProps = ComponentProps<"div"> & {
  className?: ClassValue;
  containerCls?: string;
  messageCls?: ClassValue;
  message: ReactNode;
};

export function EmptyFallback({
  className,
  message,
  children,
  containerCls,
  messageCls,
  ...restProps
}: EmptyFallbackProps) {
  return (
    <div className={containerCls}>
      <div className={cn("peer", className)} {...restProps}>
        {children}
      </div>
      <div className={cn("py-4 text-center text-light-hint hidden peer-empty:block", messageCls)}>
        {message}
      </div>
    </div>
  );
}

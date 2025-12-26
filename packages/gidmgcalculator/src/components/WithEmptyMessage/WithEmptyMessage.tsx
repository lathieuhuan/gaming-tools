import { ReactNode } from "react";
import { ClassValue, clsx } from "rond";

type WithEmptyMessageProps = {
  className?: ClassValue;
  classNames?: {
    root?: string;
    message?: string;
  };
  message: string;
  children: ReactNode;
};

export function WithEmptyMessage({
  className,
  classNames,
  message,
  children,
}: WithEmptyMessageProps) {
  return (
    <div className={classNames?.root}>
      <div className={clsx("peer", className)}>{children}</div>
      <p className="py-4 text-center text-light-hint hidden peer-empty:block">{message}</p>
    </div>
  );
}

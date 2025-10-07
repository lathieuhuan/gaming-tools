import { HTMLAttributes, ReactNode } from "react";
import { cn } from "rond";

export const CLASS_NAME = "w-full snap-center shrink-0 sm:w-88 sm:rounded-xl sm:shadow-common";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  dark?: 1 | 3;
  children?: ReactNode;
};

export function Card({ className, dark, ...props }: CardProps) {
  return (
    <div className={cn(CLASS_NAME, dark === 1 ? "bg-dark-1" : "bg-dark-3", className)} {...props} />
  );
}

import { HTMLAttributes } from "react";
import { ClassValue, cn } from "rond";

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
  className?: ClassValue;
};

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "w-full p-4 snap-center shrink-0 sm:w-88 sm:rounded-xl sm:shadow-common relative",
        className
      )}
      data-slot="calculator-card"
      {...props}
    />
  );
}

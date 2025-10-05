import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";

type SkeletonProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  className?: ClassValue;
};

export const Skeleton = ({ className, ...rest }: SkeletonProps) => (
  <div className={cn("animate-pulse bg-light-1", className)} {...rest} />
);

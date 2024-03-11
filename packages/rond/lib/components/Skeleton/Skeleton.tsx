import clsx, { type ClassValue } from "clsx";
import "./Skeleton.styles.scss";

interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  className?: ClassValue;
}

const Skeleton = ({ className, ...rest }: SkeletonProps) => (
  <div className={clsx("ron-skeleton", className)} {...rest} />
);

export { Skeleton };

import { ClassValue, cn } from "rond";

type SectionProps = React.ComponentProps<"div"> & {
  className?: ClassValue;
};

export function Section({ className, ...rest }: SectionProps) {
  return <div className={cn("border-2 border-dark-line rounded-xl", className)} {...rest} />;
}

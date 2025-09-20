import { ReactNode } from "react";
import { clsx, VersatileSelect, VersatileSelectProps } from "rond";

type StatSelectProps = VersatileSelectProps<string> & {
  prefix?: ReactNode;
  visible?: boolean;
};

export function StatSelect({ prefix, visible = true, ...rest }: StatSelectProps) {
  return (
    <div className="px-4 w-56 h-8 bg-surface-3 flex items-center">
      <div className="mr-1 pt-0.5 w-2.5 text-base text-light-default shrink-0">{prefix}</div>
      {visible ? (
        <VersatileSelect
          {...rest}
          title="Select Stat"
          className={clsx(
            "w-full",
            rest.value === "All" ? "text-light-default" : "text-bonus-color",
            rest.className
          )}
          transparent
        />
      ) : null}
    </div>
  );
}

import { cn } from "@lib/utils";
import clsx, { ClassValue } from "clsx";

export type CheckboxProps = {
  className?: ClassValue;
  name?: string;
  /** Default to 'small' */
  size?: "small" | "medium";
  defaultChecked?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onChange?: (checked: boolean) => void;
};

export const Checkbox = ({
  className,
  children,
  size = "small",
  indeterminate,
  onChange,
  ...inputProps
}: CheckboxProps) => {
  const isSmall = size === "small";

  return (
    <label
      data-slot="checkbox"
      className={cn(
        "flex items-start gap-2 group/checkbox has-[:enabled]:cursor-pointer has-[:disabled]:is-disabled",
        isSmall ? "[--height:1.5rem]" : "[--height:1.75rem]",
        className
      )}
    >
      <span className="flex-center h-[var(--height)]">
        <span
          className={clsx(
            "checkbox bg-light-2 group-hover/checkbox:has-[:enabled]:bg-light-1 rounded-sm overflow-hidden select-none relative shrink-0",
            isSmall ? "size-4.5" : "size-5.5"
          )}
        >
          <input
            type="checkbox"
            className="absolute inset-0 z-5 opacity-0 enabled:cursor-pointer peer"
            onChange={(e) => onChange?.(e.target.checked)}
            {...inputProps}
          />
          <span
            className={clsx(
              "absolute inset-0 select-none bg-active transition-opacity duration-150 flex justify-center",
              "opacity-0 peer-checked:opacity-100",
              indeterminate && "opacity-100 items-center"
            )}
          >
            {indeterminate ? (
              <span className={clsx("bg-black", isSmall ? "w-2.5 h-1" : "w-3 h-1.25")} />
            ) : (
              <span
                className={clsx(
                  "border-black border-r-[3.5px] border-b-[3.5px] border-t-0 border-l-0 rotate-45 relative top-15/100",
                  isSmall ? "w-1.75 h-2.5" : "w-[8.5px] h-[13px] border-r-4 border-b-4"
                )}
              />
            )}
          </span>
        </span>
      </span>

      {children ? (
        <span
          className={clsx(
            "h-[var(--height)] leading-[var(--height)]",
            isSmall ? "text-base" : "text-lg"
          )}
        >
          {children}
        </span>
      ) : null}
    </label>
  );
};

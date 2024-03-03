import clsx from "clsx";
import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import { forwardRef, useState, useEffect } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  unstyled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, unstyled, value = "", onChange, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      if (value !== localValue) {
        setLocalValue(value);
      }
    }, [value]);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      const { value } = e.target;

      setLocalValue(value);
      onChange?.(value);
    };

    return (
      <input
        ref={ref}
        {...props}
        type="text"
        className={clsx(
          !unstyled && "rounded leading-tight bg-light-400 focus:bg-light-100 disabled:bg-light-800 text-black",
          className
        )}
        value={localValue}
        onChange={handleChange}
      />
    );
  }
);

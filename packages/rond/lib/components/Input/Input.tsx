import clsx, { type ClassValue } from "clsx";
import { forwardRef, useState, useEffect } from "react";
import "./Input.styles.scss";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "type" | "value" | "onChange"> {
  className?: ClassValue;
  unstyled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, unstyled, value = "", onChange, ...nativeProps } = props;
  const isControlled = "value" in props;
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (!isControlled) {
      setLocalValue(value);
    }
    onChange?.(value);
  };

  return (
    <input
      ref={ref}
      {...nativeProps}
      type="text"
      className={clsx(!unstyled && "ron-input", className)}
      value={isControlled ? value : localValue}
      onChange={handleChange}
    />
  );
});

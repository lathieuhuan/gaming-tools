import clsx, { type ClassValue } from "clsx";
import { forwardRef, useState, useEffect } from "react";

type Size = "small" | "medium" | "large";

const classBySize: Record<Size, string> = {
  small: "py-1 px-2 text-base leading-5",
  medium: "py-1 px-3 text-lg leading-6",
  large: "py-1 px-3 text-xl leading-7",
};

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className" | "type" | "size" | "value" | "onChange"
> & {
  className?: ClassValue;
  /** Default to 'small' */
  size?: Size;
  unstyled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, size = "small", unstyled, value = "", onChange, ...nativeProps } = props;
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
      className={clsx(
        !unstyled &&
          `rounded-sm bg-light-3 text-black font-medium focus:bg-light-2 disabled:bg-light-disabled ${classBySize[size]}`,
        className
      )}
      value={isControlled ? value : localValue}
      onChange={handleChange}
    />
  );
});

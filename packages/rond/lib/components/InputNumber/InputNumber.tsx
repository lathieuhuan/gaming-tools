import clsx from "clsx";
import { forwardRef, useState, useEffect } from "react";
import { round } from "../../utils";
import "./InputNumber.styles.scss";

interface InputNumberProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "max" | "min" | "onChange"> {
  value?: number;
  /** Default to 9999 */
  max?: number;
  /** Default to 0 */
  min?: number;
  /** Default to 0 */
  maxDecimalDigits?: number;
  unstyled?: boolean;
  onChange?: (value: number) => void;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>((props, ref) => {
  const { className, value = 0, maxDecimalDigits = 0, unstyled, onBlur, onKeyDown, onChange, ...nativeProps } = props;
  const [localValue, setLocalValue] = useState(`${value}`);

  useEffect(() => {
    if (localValue !== "-" && value !== +localValue) {
      setLocalValue(`${value}`);
    }
  }, [value]);

  const updateValue = (newLocalValue: string, newValue: number) => {
    if (newLocalValue !== localValue) {
      setLocalValue(newLocalValue);
    }
    if (newValue !== value) {
      onChange?.(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);

    if (
      e.ctrlKey ||
      ["ArrowRight", "ArrowLeft", "Backspace", "Delete", "Home", "End", "Tab"].includes(e.key) ||
      !isNaN(+e.key) ||
      (e.key === "." && maxDecimalDigits) ||
      (e.key === "-" && props.min && props.min < 0)
    ) {
      return;
    }
    e.preventDefault();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onFocus?.(e);
    e.currentTarget.setSelectionRange(0, 20);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { min = 0, max = 9999 } = props;
    const input = e.target.value;
    let newLocalValue: string | undefined;
    let newValue: number | undefined;

    switch (input) {
      case "":
        newLocalValue = "0";
        newValue = 0;
        break;
      case ".":
      case "0.":
        newLocalValue = "0.";
        newValue = 0;
        break;
      case "-":
      case "0-":
        newLocalValue = "-";
        newValue = 0;
        break;
      case "-0":
        newLocalValue = "-0";
        newValue = 0;
        break;
      default: {
        const numInput = +input;

        if (!isNaN(numInput)) {
          const dotIndex = input.indexOf(".");

          if (dotIndex !== -1) {
            const roundedInput = round(numInput, maxDecimalDigits);
            newLocalValue = `${roundedInput}${dotIndex === input.length - 1 ? "." : ""}`;
            newValue = roundedInput;
          } else {
            newLocalValue = `${numInput}`;
            newValue = numInput;
          }
        }
      }
    }

    if (newValue !== undefined && newLocalValue !== undefined && newValue >= min && newValue <= max) {
      updateValue(newLocalValue, newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);

    if (localValue === "-" || localValue === "-0") {
      updateValue("0", 0);
    } else if (localValue.slice(-1) === ".") {
      const newLocalValue = localValue.slice(0, -1);
      updateValue(newLocalValue, +newLocalValue);
    }
  };

  return (
    <input
      ref={ref}
      {...nativeProps}
      type="text"
      className={clsx(!unstyled && "ron-input-number", className)}
      value={localValue}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
});

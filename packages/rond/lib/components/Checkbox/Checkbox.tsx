import clsx, { ClassValue } from "clsx";
import "./Checkbox.styles.scss";

export interface CheckboxProps {
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
}
export const Checkbox = ({
  className,
  children,
  size = "small",
  indeterminate,
  onChange,
  ...inputProps
}: CheckboxProps) => {
  return (
    <label className={clsx(`ron-checkbox__wrapper ron-checkbox__wrapper--${size}`, className)}>
      <span className="ron-flex-center">
        <span className="ron-checkbox">
          <input
            type="checkbox"
            className="ron-checkbox__input"
            onChange={(e) => onChange?.(e.target.checked)}
            {...inputProps}
          />
          {indeterminate ? (
            <span key="indeterminate" className={`ron-checkbox__visual ron-checkbox__visual--indeterminate`} />
          ) : (
            <span key="checked" className={`ron-checkbox__visual ron-checkbox__visual--checked`} />
          )}
        </span>
      </span>

      {children ? <span className="ron-checkbox__label">{children}</span> : null}
    </label>
  );
};

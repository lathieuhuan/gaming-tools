import clsx, { ClassValue } from "clsx";
import "./styles.scss";

interface CheckboxProps {
  className?: ClassValue;
  name?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  readOnly?: boolean;
  children?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}
export const Checkbox = ({ className, readOnly, children, onChange, ...inputProps }: CheckboxProps) => {
  return (
    <label className={clsx("ron-checkbox-wrapper", className)}>
      <span className="ron-checkbox">
        <input
          type="checkbox"
          className="ron-checkbox-input"
          onChange={(e) => onChange?.(e.target.checked)}
          {...inputProps}
        />
        <span className="ron-checkbox-visual" />
      </span>

      <span className="ron-checkbox-label">{children}</span>
    </label>
  );
};

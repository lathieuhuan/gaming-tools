import { type ClassValue } from "clsx";
import { Button } from "../Button";
import { SelectAction, type SelectProps } from "./Select.types";

interface SelectWrapProps extends Pick<SelectProps, "style" | "size"> {
  action?: Omit<SelectAction, "onClick"> & {
    onClick?: () => void;
  };
  children: (cls?: ClassValue, style?: React.CSSProperties) => React.JSX.Element | null;
}
export function SelectWrap(props: SelectWrapProps) {
  if (props.action) {
    return (
      <div className="ron-select__wrapper" style={props.style}>
        {props.children("ron-select--half")}
        <Button
          {...props.action}
          className={`ron-select__action ron-select__action--${props.size}`}
          size="custom"
          shape="custom"
          withShadow={false}
        />
      </div>
    );
  }

  return props.children(null, props.style);
}

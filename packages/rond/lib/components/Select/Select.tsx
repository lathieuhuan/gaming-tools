import ReactDOM from "react-dom";
import clsx, { ClassValue } from "clsx";
import { useRef, useState } from "react";
import { ChevronDownSvg } from "../svg-icons";
import "./Select.styles.scss";

export type SelectOption = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  className?: string;
  // [name: string]: any;
};

export interface SelectProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  /** Default to 'small' */
  size?: "small" | "medium";
  transparent?: boolean;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
}
export function Select(props: SelectProps) {
  const { size = "small" } = props;
  const dropdown = useRef<HTMLDivElement>(null);
  const virgin = useRef(true);
  // const [dropped, setDropped] = useState(false);
  // const [] = useState();

  const onClickSelect = () => {
    if (virgin.current) {
      const handleClick = () => {
        if (dropdown.current) {
          dropdown.current.style.display = "none";
        }
        document.removeEventListener("click", handleClick);
      };

      document.addEventListener("click", handleClick);

      ReactDOM.createPortal(
        <div ref={dropdown} className="ron-select__dropdown" style={{ display: "block" }}>
          {props.options.map((option) => {
            return <div>{option.label}</div>;
          })}
        </div>,
        document.body
      );
    } else if (dropdown.current) {
      dropdown.current.style.display = "block";
    }

    // if (virgin.current) {
    //   virgin.current = false;
    // }

    // if (!dropped) {
    //   setDropped(true);
    // }
  };

  return (
    <div
      className={clsx(
        `ron-select ron-select--${size}`,
        props.transparent && "ron-select--transparent",
        props.className
      )}
      style={props.style}
      onClick={onClickSelect}
    >
      <div className="ron-select__selector">{props.options.find((option) => option.value === props.value)?.label}</div>
      <span className="ron-select__arrow">
        <ChevronDownSvg />
      </span>
      {}
    </div>
  );
}

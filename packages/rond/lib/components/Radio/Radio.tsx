import "./Radio.styles.scss";

export interface RadioProps {
  id?: string;
  name?: string;
  /** Default to 'small' */
  size?: "small" | "medium" | "large";
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
}
export function Radio(props: RadioProps) {
  const { size = "small" } = props;
  return (
    <span className="ron-radio">
      <input
        type="radio"
        className="ron-radio__input"
        id={props.id}
        name={props.name}
        checked={props.checked}
        onChange={(e) => props.onChange?.(e.target.checked)}
        onClick={props.onClick}
      />
      <span className={`ron-radio__visual ron-radio__visual--${size}`} />
    </span>
  );
}

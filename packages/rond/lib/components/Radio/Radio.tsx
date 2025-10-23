import clsx from "clsx";

type Size = "small" | "medium" | "large";

const classBySize: Record<Size, string> = {
  small: "size-4 border-3 has-checked:border-2",
  medium: "size-5 border-[3.5px] has-checked:border-[2.5px]",
  large: "size-6 border-4 has-checked:border-3",
};

export type RadioProps = {
  id?: string;
  name?: string;
  /** Default 'small' */
  size?: Size;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
};

export function Radio(props: RadioProps) {
  const { size = "small" } = props;

  return (
    <span
      className={clsx(
        `relative overflow-hidden cursor-pointer flex-center rounded-circle select-none border-light-3 has-checked:border-light-3/70 ${classBySize[size]}`,
        props.disabled && "is-disabled"
      )}
    >
      <input
        type="radio"
        className="absolute inset-0 z-10 opacity-0 cursor-pointer peer"
        id={props.id}
        name={props.name}
        checked={props.checked}
        disabled={props.disabled}
        onChange={(e) => props.onChange?.(e.target.checked)}
        onClick={props.onClick}
      />
      <span className="bg-active rounded-circle transition-all duration-200 size-0 peer-checked:size-2/3 opacity-80 peer-checked:opacity-100" />
    </span>
  );
}

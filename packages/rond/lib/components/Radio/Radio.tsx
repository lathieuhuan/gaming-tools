import clsx from "clsx";

type Size = "small" | "medium" | "large";

const classBySize: Record<Size, string> = {
  small: "size-4 border-3 peer-checked:border-4",
  medium: "size-5 border-[3.5px] peer-checked:border-[5.5px]",
  large: "size-6 border-4 peer-checked:border-6",
};

export type RadioProps = {
  id?: string;
  name?: string;
  /** Default to 'small' */
  size?: Size;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
};

export function Radio(props: RadioProps) {
  const { size = "small" } = props;

  return (
    <span className="w-fit relative overflow-hidden cursor-pointer flex rounded-circle select-none">
      <input
        type="radio"
        className="absolute inset-0 z-10 opacity-0 cursor-pointer peer"
        id={props.id}
        name={props.name}
        checked={props.checked}
        onChange={(e) => props.onChange?.(e.target.checked)}
        onClick={props.onClick}
      />
      <span
        className={clsx(
          `flex rounded-circle select-none border-light-4 peer-checked:border-active-bg ${classBySize[size]}`,
          "before:size-full before:rounded-circle before:opacity-0 before:transition-opacity before:duration-200 peer-checked:before:opacity-100"
        )}
      />
    </span>
  );
}

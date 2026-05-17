import { clsx } from "rond";

type EventHeadingProps = {
  active: boolean;
  text: string;
  onClickHeading?: () => void;
};

export function EventHeading({ active, text, onClickHeading }: EventHeadingProps) {
  return (
    <div
      className={clsx(
        "text-sm rounded-xs flex items-center",
        active ? "text-black bg-primary-2" : "text-light-2 bg-dark-2",
      )}
    >
      <button
        className="px-2 py-1 cursor-pointer grow flex justify-between gap-2 glow-on-hover"
        onClick={() => onClickHeading?.()}
      >
        <span className="text-left font-semibold">{text}</span>
      </button>
    </div>
  );
}

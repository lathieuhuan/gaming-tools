import { useEffect } from "react";
import { clsx } from "rond";
import { useDisplayerState } from "./coordinator-context";

const icon = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 256 256"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M216,32H152a8,8,0,0,0-6.34,3.12l-64,83.21L72,108.69a16,16,0,0,0-22.64,0l-12.69,12.7a16,16,0,0,0,0,22.63l20,20-28,28a16,16,0,0,0,0,22.63l12.69,12.68a16,16,0,0,0,22.62,0l28-28,20,20a16,16,0,0,0,22.64,0l12.69-12.7a16,16,0,0,0,0-22.63l-9.64-9.64,83.21-64A8,8,0,0,0,224,104V40A8,8,0,0,0,216,32ZM52.69,216,40,203.32l28-28L80.68,188Zm70.61-8L48,132.71,60.7,120,136,195.31ZM208,100.06l-81.74,62.88L115.32,152l50.34-50.34a8,8,0,0,0-11.32-11.31L104,140.68,93.07,129.74,155.94,48H208Z"></path>
  </svg>
);

interface AttackEventDisplayerProps {
  label: string;
  id: string;
  disabled?: boolean;
  children: React.ReactNode | (() => React.ReactNode);
  onQuickHit: () => void;
}
export function AttackEventDisplayer(props: AttackEventDisplayerProps) {
  const { isActive, toggle } = useDisplayerState(props.id);

  useEffect(() => {
    if (props.disabled && isActive) {
      toggle();
    }
  }, [props.disabled]);

  return (
    <div>
      <div
        className={clsx(
          "h-8 font-medium rounded-sm cursor-pointer glow-on-hover overflow-hidden flex items-center",
          isActive ? "bg-primary-2 text-black" : "bg-surface-3"
        )}
        onClick={toggle}
      >
        <span className="px-2">{props.label}</span>

        <button
          className={clsx(
            "ml-auto w-8 h-full text-xl text-light-default/60 rounded-sm hover:bg-primary-1 hover:text-black transition-all",
            isActive || props.disabled ? "hidden" : "flex-center"
          )}
          onClick={(e) => {
            e.stopPropagation();
            props.onQuickHit();
          }}
        >
          {icon}
        </button>
      </div>

      {isActive && !props.disabled && (
        <div className="p-2">{typeof props.children === "function" ? props.children() : props.children}</div>
      )}
    </div>
  );
}

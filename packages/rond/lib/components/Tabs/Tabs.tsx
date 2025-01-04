import clsx, { type ClassValue } from "clsx";
import "./Tabs.styles.scss";

export type TabConfig =
  | string
  | {
      text: string;
      disabled?: boolean;
    };

export interface TabsProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  level?: number;
  activeIndex?: number;
  configs?: TabConfig[];
  onClickTab?: (index: number) => void;
}
export function Tabs({ className, style, level = 1, configs, activeIndex = 0, onClickTab }: TabsProps) {
  return (
    <div className={clsx("ron-tabs", className)} style={style}>
      {configs?.map((config, index) => {
        const { text, disabled = false } = typeof config === "string" ? { text: config } : config;

        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            className={clsx(
              "ron-tab ron-flex-center",
              index === activeIndex ? `ron-tab--lv${level}-active` : "ron-tab--inactive ron-glow-on-hover",
              disabled && "ron-disabled"
            )}
            onClick={() => onClickTab?.(index)}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

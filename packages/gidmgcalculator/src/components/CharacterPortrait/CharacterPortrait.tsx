import { FaPlus } from "react-icons/fa";
import { clsx, type ClassValue } from "rond";
import { ElementType } from "@Backend";
import { GenshinImage } from "@Src/components";

type PortraitSize = "small" | "medium" | "custom";

const sizeCls: Partial<Record<PortraitSize, string>> = {
  small: "w-16 h-16",
  medium: "w-18 h-18",
};

interface CharacterPortraitProps {
  className?: ClassValue;
  info?: {
    name?: string;
    code?: number;
    icon: string;
    vision?: ElementType;
  };
  /** Default to 'medium' */
  size?: PortraitSize;
  withColorBg?: boolean;
  recruitable?: boolean;
  /** Default to true */
  zoomable?: boolean;
  onClick?: () => void;
}
export function CharacterPortrait(props: CharacterPortraitProps) {
  const { info, size = "medium", zoomable = true, onClick } = props;
  const { code = 0, icon, vision } = info || {};

  const isTraveler = [1, 12, 46, 57, 75].includes(code);
  const { withColorBg = isTraveler } = props;

  const cls = [
    "shrink-0 overflow-hidden rounded-circle",
    info && zoomable && "zoomin-on-hover",
    sizeCls[size],
    withColorBg && vision ? `bg-${vision}` : "bg-surface-3",
    props.className,
  ];

  if (props.recruitable) {
    if (!info) cls.push("flex-center glow-on-hover");

    return (
      <button className={clsx(cls)} title={info?.name} onClick={onClick}>
        {info ? <GenshinImage src={icon} imgType="character" fallbackCls="p-2" /> : <FaPlus className="text-2xl" />}
      </button>
    );
  }

  return (
    <div className={clsx(cls)} title={info?.name} onClick={onClick}>
      {info ? <GenshinImage src={icon} imgType="character" fallbackCls="p-2" /> : null}
    </div>
  );
}
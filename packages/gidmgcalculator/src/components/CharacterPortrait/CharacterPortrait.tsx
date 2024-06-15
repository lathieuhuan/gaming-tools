import { FaPlus } from "react-icons/fa";
import { clsx, type ClassValue } from "rond";
import { ElementType } from "@Backend";
import { GenshinImage } from "@Src/components";

type PortraitSize = "small" | "medium" | "custorm";

const sizeCls: Partial<Record<PortraitSize, string>> = {
  small: "w-16 h-16",
  medium: "w-18 h-18",
};

interface CharacterPortraitProps {
  className?: ClassValue;
  info?: {
    name?: string;
    code: number;
    icon: string;
    vision?: ElementType;
  };
  /** Default to 'medium' */
  size?: PortraitSize;
  withColorBg?: boolean;
  recruitable?: boolean;
  onClick?: () => void;
}
export function CharacterPortrait({
  className,
  info,
  size = "medium",
  withColorBg,
  recruitable,
  onClick,
}: CharacterPortraitProps) {
  const { code = 0, icon, vision } = info || {};

  // for the traveler
  const bgColorByCode: Record<number, string> = {
    1: "bg-anemo",
    12: "bg-geo",
    46: "bg-electro",
    57: "bg-dendro",
  };

  const cls = [
    "shrink-0 overflow-hidden rounded-circle",
    info && "zoomin-on-hover",
    sizeCls[size],
    withColorBg && vision ? `bg-${vision}` : bgColorByCode[code] ?? "bg-surface-3",
    className,
  ];

  if (recruitable) {
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

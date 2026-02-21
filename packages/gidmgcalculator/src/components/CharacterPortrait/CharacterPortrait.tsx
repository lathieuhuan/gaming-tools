import { FaPlus } from "react-icons/fa";
import { clsx, type ClassValue } from "rond";

import { $AppCharacter } from "@/services";
import type { ElementType } from "@/types";

import { GenshinImage } from "@/components";

type PortraitSize = "small" | "medium" | "custom";

const sizeCls: Partial<Record<PortraitSize, string>> = {
  small: "w-16 h-16",
  medium: "w-18 h-18",
};

type CharacterPortraitProps = React.AriaAttributes & {
  id?: string;
  className?: ClassValue;
  imgCls?: ClassValue;
  info?: {
    name?: string;
    code?: number;
    icon: string;
    vision?: ElementType;
  };
  /** Default 'medium' */
  size?: PortraitSize;
  withColorBg?: boolean;
  recruitable?: boolean;
  /** Default true */
  zoomable?: boolean;
  onClick?: () => void;
};

export function CharacterPortrait({
  id,
  className,
  imgCls,
  info,
  size = "medium",
  zoomable = true,
  recruitable,
  withColorBg: withColorBgProp,
  onClick,
  ...ariaAttributes
}: CharacterPortraitProps) {
  const { code, icon, vision } = info || {};

  const isTraveler = code ? $AppCharacter.checkIsTraveler({ code }) : false;
  const withColorBg = withColorBgProp ?? isTraveler;

  const cls = [
    "shrink-0 overflow-hidden rounded-circle",
    info && zoomable && "zoomin-on-hover",
    sizeCls[size],
    withColorBg && vision ? `bg-${vision}` : "bg-dark-3",
    className,
  ];

  if (recruitable) {
    return (
      <button
        id={id}
        className={clsx(cls, !info && "flex-center glow-on-hover")}
        title={info?.name}
        onClick={onClick}
        {...ariaAttributes}
      >
        {info ? (
          <GenshinImage src={icon} imgType="character" imgCls={imgCls} fallbackCls="p-2" />
        ) : (
          <FaPlus className="text-2xl" />
        )}
      </button>
    );
  }

  return (
    <div id={id} className={clsx(cls)} title={info?.name} onClick={onClick} {...ariaAttributes}>
      {info && <GenshinImage src={icon} imgType="character" imgCls={imgCls} fallbackCls="p-2" />}
    </div>
  );
}

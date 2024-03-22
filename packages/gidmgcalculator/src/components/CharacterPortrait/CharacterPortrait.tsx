import { clsx } from "rond";
import { GenshinImage } from "@Src/components";

type PortraitSize = "small" | "medium";

const sizeCls: Record<PortraitSize, string> = {
  small: "w-16 h-16",
  medium: "w-18 h-18",
};

interface CharacterPortraitProps {
  className?: string;
  info: {
    code: number;
    icon: string;
  };
  /** Default to 'medium' */
  size?: PortraitSize;
  onClick?: () => void;
}
export function CharacterPortrait({ className, info, size = "medium", onClick }: CharacterPortraitProps) {
  const { code = 0, icon } = info || {};

  // for the traveler
  const bgColorByCode: Record<number, string> = {
    1: "bg-anemo",
    12: "bg-geo",
    46: "bg-electro",
    57: "bg-dendro",
  };

  return (
    <div
      className={clsx(
        "shrink-0 zoomin-on-hover overflow-hidden rounded-circle",
        sizeCls[size],
        `${bgColorByCode[code] || "bg-dark-500"}`,
        className
      )}
      onClick={onClick}
    >
      <GenshinImage src={icon} imgType="character" defaultFallback={{ wrapperCls: "p-2" }} />
    </div>
  );
}

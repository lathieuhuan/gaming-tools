import { clsx } from "rond";
import { GenshinImage } from "@Src/components";

interface CharacterPortraitProps {
  className?: string;
  code: number;
  icon: string;
  onClickIcon?: () => void;
}
export function CharacterPortrait({ className, code, icon, onClickIcon }: CharacterPortraitProps) {
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
        "w-full h-full zoomin-on-hover overflow-hidden rounded-circle",
        `${bgColorByCode[code] || "bg-dark-500"}`,
        className
      )}
      onClick={onClickIcon}
    >
      <GenshinImage src={icon} imgType="character" />
    </div>
  );
}

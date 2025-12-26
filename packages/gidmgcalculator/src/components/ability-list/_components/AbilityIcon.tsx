import { clsx, type ClassValue } from "rond";

import type { ElementType } from "@/types";
import { GenshinImage } from "@/components/GenshinImage";

import styles from "../styles.module.scss";

export const ABILITY_ICON_SIZE = "3.25rem";

type AbilityImgProps = {
  className?: ClassValue;
  img?: string;
  vision: ElementType;
  active?: boolean;
  onClick?: () => void;
};

export function AbilityIcon({ className, img, vision, active = true, onClick }: AbilityImgProps) {
  return (
    <button
      className={clsx(
        "transition-opacity duration-150 ease-in-out",
        !active && "opacity-50",
        className
      )}
      onClick={onClick}
    >
      <GenshinImage
        src={img}
        width={ABILITY_ICON_SIZE}
        height={ABILITY_ICON_SIZE}
        fallbackCls={`p-3 rounded-circle bg-${vision} ${styles[vision]}`}
      />
    </button>
  );
}

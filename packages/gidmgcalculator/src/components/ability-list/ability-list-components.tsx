import { FaCaretRight } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { clsx, type ClassValue } from "rond";
import { ElementType } from "@Calculation";

import { GenshinImage } from "../GenshinImage";
import styles from "./ability-list.styles.module.scss";

const ABILITY_ICON_SIZE = "3.25rem";

interface AbilityImgProps {
  className?: ClassValue;
  img?: string;
  vision: ElementType;
  active?: boolean;
  onClick?: () => void;
}
export function AbilityIcon({ className, img, vision, active = true, onClick }: AbilityImgProps) {
  return (
    <button
      className={clsx("transition-opacity duration-150 ease-in-out", !active && "opacity-50", className)}
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

interface AbilityCarouselProps {
  className?: string;
  currentIndex: number;
  images: (string | undefined)[];
  vision: ElementType;
  label?: React.ReactNode;
  onClickBack: () => void;
  onClickNext: () => void;
}
export function AbilityCarousel({
  className = "",
  currentIndex,
  images,
  vision,
  label,
  onClickBack,
  onClickNext,
}: AbilityCarouselProps) {
  const renderCaret = (direction: "right" | "left", disabled: boolean) => {
    const caretCls = `absolute top-2 w-10 h-10 flex-center text-surface-border flex-center ${
      disabled ? "cursor-pointer opacity-50" : "hover:text-secondary-1"
    }`;

    return direction === "right" ? (
      <button className={`${caretCls} left-full ml-4`} disabled={disabled} onClick={onClickNext}>
        {disabled ? <TbRectangleVerticalFilled className="text-2xl" /> : <FaCaretRight className="text-4xl" />}
      </button>
    ) : (
      <button className={`${caretCls} right-full mr-4`} disabled={disabled} onClick={onClickBack}>
        {disabled ? (
          <TbRectangleVerticalFilled className="text-2xl" />
        ) : (
          <FaCaretRight className="text-4xl rotate-180" />
        )}
      </button>
    );
  };

  return (
    <div className={"flex-center relative " + className}>
      {label ? <p className="absolute top-0 left-0 w-1/4 text-sm">{label}</p> : null}

      <div className="relative">
        <div
          className="overflow-hidden relative"
          style={{
            width: ABILITY_ICON_SIZE,
            height: ABILITY_ICON_SIZE,
          }}
        >
          <div
            className="absolute top-0 flex transition-transform ease-linear"
            style={{ transform: `translateX(calc(-${currentIndex} * ${ABILITY_ICON_SIZE}))` }}
          >
            {images.map((img, i) => (
              <AbilityIcon key={i} img={img} vision={vision} />
            ))}
          </div>
        </div>

        {renderCaret("left", currentIndex <= 0)}
        {renderCaret("right", currentIndex >= images.length - 1)}
      </div>
    </div>
  );
}

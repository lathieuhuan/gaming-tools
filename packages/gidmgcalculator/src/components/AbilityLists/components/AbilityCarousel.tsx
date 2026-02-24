import { FaCaretRight } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";

import type { ElementType } from "@/types";
import { ABILITY_ICON_SIZE, AbilityIcon } from "./AbilityIcon";

type AbilityCarouselProps = {
  className?: string;
  currentIndex: number;
  images: (string | undefined)[];
  vision: ElementType;
  label?: React.ReactNode;
  onClickBack: () => void;
  onClickNext: () => void;
};

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
    const caretCls = `absolute top-2 size-10 text-dark-line flex-center ${
      disabled ? "opacity-50" : "hover:text-secondary-1"
    }`;

    return direction === "right" ? (
      <button className={`${caretCls} left-full ml-4`} disabled={disabled} onClick={onClickNext}>
        {disabled ? (
          <TbRectangleVerticalFilled className="text-2xl" />
        ) : (
          <FaCaretRight className="text-4xl" />
        )}
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

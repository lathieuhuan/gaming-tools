import { FaCaretRight } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";

import type { ElementType } from "@/types";
import { ABILITY_ICON_SIZE, AbilityIcon } from "./AbilityIcon";
import { clsx } from "rond";

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

        <MoveButton direction="left" disabled={currentIndex <= 0} onClick={onClickBack} />
        <MoveButton
          direction="right"
          disabled={currentIndex >= images.length - 1}
          onClick={onClickNext}
        />
      </div>
    </div>
  );
}

const MoveButton = ({
  direction,
  disabled,
  onClick,
}: {
  direction: "right" | "left";
  disabled: boolean;
  onClick: () => void;
}) => {
  const isLeft = direction === "left";

  return (
    <button
      className={clsx(
        "absolute top-2 size-10 text-dark-line flex-center",
        disabled ? "opacity-50" : "hover:text-secondary-1",
        isLeft ? "right-full mr-4" : "left-full ml-4",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {disabled ? (
        <TbRectangleVerticalFilled className="text-2xl" />
      ) : (
        <FaCaretRight className={clsx("text-4xl", isLeft && "rotate-180")} />
      )}
    </button>
  );
};

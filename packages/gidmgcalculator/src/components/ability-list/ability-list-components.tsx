import clsx from "clsx";
import type { ReactNode } from "react";
import { FaCaretRight, FaQuestion, FaSquare } from "react-icons/fa";

import type { ElementType } from "@Src/types";
import { getImgSrc } from "@Src/utils";
import styles from "./styles.module.scss";

const ABILITY_ICON_SIZE = "3.25rem";

interface AbilityImgProps {
  className?: string;
  img?: string;
  elementType: ElementType;
  active?: boolean;
  onClick?: () => void;
}
export const AbilityIcon = ({ className, img, elementType, active = true, onClick }: AbilityImgProps) => {
  const commonClassNames = ["transition-opacity duration-150 ease-in-out", !active && "opacity-50"];
  const style = {
    width: ABILITY_ICON_SIZE,
    height: ABILITY_ICON_SIZE,
  };

  return img ? (
    <img
      className={clsx(commonClassNames, className)}
      src={getImgSrc(img)}
      alt=""
      style={style}
      draggable={false}
      onClick={onClick}
    />
  ) : (
    <div
      className={clsx(`rounded-circle bg-${elementType} flex-center`, styles[elementType], commonClassNames, className)}
      style={style}
      onClick={onClick}
    >
      <FaQuestion className="text-xl" />
    </div>
  );
};

interface AbilityCarouselProps {
  className?: string;
  currentIndex: number;
  images: (string | undefined)[];
  elementType: ElementType;
  label?: ReactNode;
  onClickBack: () => void;
  onClickNext: () => void;
}
export const AbilityCarousel = ({
  className = "",
  currentIndex,
  images,
  elementType,
  label,
  onClickBack,
  onClickNext,
}: AbilityCarouselProps) => {
  const renderCaret = (direction: "right" | "left", disabled: boolean) => {
    const caretCls = `absolute top-2 w-10 h-10 flex-center text-dark-500 flex-center ${
      disabled ? "cursor-pointer opacity-50" : "hover:text-mint-600"
    }`;

    return direction === "right" ? (
      <button className={`${caretCls} left-full ml-4`} disabled={disabled} onClick={onClickNext}>
        {disabled ? <FaSquare className="text-2xl" /> : <FaCaretRight className="text-4xl" />}
      </button>
    ) : (
      <button className={`${caretCls} right-full mr-4`} disabled={disabled} onClick={onClickBack}>
        {disabled ? <FaSquare className="text-2xl" /> : <FaCaretRight className="text-4xl rotate-180" />}
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
              <AbilityIcon key={i} img={img} elementType={elementType} />
            ))}
          </div>
        </div>

        {renderCaret("left", currentIndex <= 0)}
        {renderCaret("right", currentIndex >= images.length - 1)}
      </div>
    </div>
  );
};

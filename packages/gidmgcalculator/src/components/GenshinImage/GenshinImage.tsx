import type { IconBaseProps, IconType } from "react-icons";
import { FaUser, FaQuestion } from "react-icons/fa";
import { RiSwordFill } from "react-icons/ri";
import { Image, type ImageProps } from "rond";
import { getImgSrc } from "@/utils/getImgSrc";

const ICONS_BY_TYPE: Record<string, IconType> = {
  character: FaUser,
  weapon: RiSwordFill,
  artifact: FaQuestion,
};

type FallbackProps = IconBaseProps;

type DefaultImageFallbackProps = FallbackProps & {
  type: "character" | "weapon" | "artifact";
};

function DefaultFallback({ type, className, ...rest }: DefaultImageFallbackProps) {
  const Fallback = type in ICONS_BY_TYPE ? ICONS_BY_TYPE[type] : FaQuestion;
  return (
    <div className={className}>
      <Fallback className="w-full h-full" {...rest} />
    </div>
  );
}

export type GenshinImageProps = Omit<ImageProps, "fallback" | "defaultFallback"> & {
  /** Default 'unknown' */
  imgType?: "character" | "weapon" | "artifact" | "unknown";
  fallbackCls?: string;
};

function GenshinImage({ src, imgType = "unknown", fallbackCls, ...rest }: GenshinImageProps) {
  return (
    <Image
      src={getImgSrc(src)}
      showFallbackOnError
      defaultFallback={{ type: imgType, className: fallbackCls }}
      {...rest}
    />
  );
}

GenshinImage.Fallback = DefaultFallback;

export { GenshinImage };

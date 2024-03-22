import type { IconBaseProps, IconType } from "react-icons";
import { FaUser, FaQuestion } from "react-icons/fa";
import { RiSwordFill } from "react-icons/ri";
import { Image, type ImageProps } from "rond";

const ICONS_BY_TYPE: Record<string, IconType> = {
  character: FaUser,
  weapon: RiSwordFill,
  artifact: FaQuestion,
};

type FallbackProps = IconBaseProps;

interface DefaultImageFallbackProps extends FallbackProps {
  type: "character" | "weapon" | "artifact";
}
function DefaultFallback({ type, className, ...rest }: DefaultImageFallbackProps) {
  const Fallback = ICONS_BY_TYPE[type || ""] ?? FaQuestion;
  return (
    <div className={className}>
      <Fallback className="w-full h-full" {...rest} />
    </div>
  );
}

interface GiImageProps extends Omit<ImageProps, "fallback" | "defaultFallback"> {
  /** Default to 'unknown' */
  imgType?: "character" | "weapon" | "artifact" | "unknown";
  fallbackCls?: string;
}
function GenshinImage({ src, imgType = "unknown", fallbackCls, ...rest }: GiImageProps) {
  // const isDevEnv = import.meta.env.DEV;
  const isDevEnv = false;
  let finalSrc = "";

  if (!isDevEnv && src) {
    const isFromWiki = src.split("/")[0].length === 1;
    finalSrc = isFromWiki ? `https://static.wikia.nocookie.net/gensin-impact/images/${src}.png` : src;
  }
  return (
    <Image src={finalSrc} showFallbackOnError defaultFallback={{ type: imgType, className: fallbackCls }} {...rest} />
  );
}

GenshinImage.Fallback = DefaultFallback;

export { GenshinImage };

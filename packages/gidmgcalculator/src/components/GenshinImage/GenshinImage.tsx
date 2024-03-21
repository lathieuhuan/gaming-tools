import type { IconBaseProps, IconType } from "react-icons";
import { FaUser, FaQuestion } from "react-icons/fa";
import { RiSwordFill } from "react-icons/ri";
import { clsx, Image, type ImageProps } from "rond";

const ICONS_BY_TYPE: Record<string, IconType> = {
  character: FaUser,
  weapon: RiSwordFill,
  artifact: FaQuestion,
};

type FallbackProps = IconBaseProps & {
  wrapperCls?: string;
};

interface DefaultImageFallbackProps extends FallbackProps {
  type: "character" | "weapon" | "artifact";
}
function DefaultFallback({ type, wrapperCls, className, ...rest }: DefaultImageFallbackProps) {
  const Fallback = ICONS_BY_TYPE[type || ""] ?? FaQuestion;
  return (
    <div className={wrapperCls}>
      <Fallback className={clsx("w-full h-full", className)} {...rest} />
    </div>
  );
}

interface GiImageProps extends Omit<ImageProps, "defaultFallback"> {
  /** Default to 'unknown' */
  imgType?: "character" | "weapon" | "artifact" | "unknown";
  defaultFallback?: FallbackProps;
}
function GenshinImage({ src, imgType = "unknown", defaultFallback, ...rest }: GiImageProps) {
  const isDevEnv = import.meta.env.DEV;
  // const isDevEnv = false;
  let finalSrc = "";

  if (!isDevEnv && src) {
    const isFromWiki = src.split("/")[0].length === 1;
    finalSrc = isFromWiki ? `https://static.wikia.nocookie.net/gensin-impact/images/${src}.png` : src;
  }
  return <Image src={finalSrc} showFallbackOnError defaultFallback={{ type: imgType, ...defaultFallback }} {...rest} />;
}

GenshinImage.Fallback = DefaultFallback;

export { GenshinImage };

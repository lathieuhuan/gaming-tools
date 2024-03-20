import type { IconBaseProps, IconType } from "react-icons";
import { FaUser, FaQuestion } from "react-icons/fa";
import { RiSwordFill } from "react-icons/ri";
import { clsx, Image, type ImageProps } from "rond";
import { getImgSrc } from "@Src/utils";

const ICONS_BY_TYPE: Record<string, IconType> = {
  character: FaUser,
  weapon: RiSwordFill,
  artifact: FaQuestion,
};

type FallbackProps = IconBaseProps & {
  wrapperCls: string;
};

interface DefaultImageFallbackProps extends FallbackProps {
  type: "character" | "weapon" | "artifact";
}
export function DefaultFallback({ type, wrapperCls, className, ...rest }: DefaultImageFallbackProps) {
  const Fallback = ICONS_BY_TYPE[type || ""] ?? FaQuestion;
  return (
    <div className={wrapperCls}>
      <Fallback className={clsx("w-full h-full", className)} {...rest} />
    </div>
  );
}

interface WikiImageProps extends Omit<ImageProps, "defaultFallback"> {
  /** Default to 'unknown' */
  imgType?: "character" | "weapon" | "artifact" | "unknown";
  defaultFallback?: FallbackProps;
}
function WikiImage({ src, imgType = "unknown", defaultFallback, ...rest }: WikiImageProps) {
  return (
    <Image src={getImgSrc(src)} showFallbackOnError defaultFallback={{ type: imgType, ...defaultFallback }} {...rest} />
  );
}

WikiImage.Fallback = DefaultFallback;

export { WikiImage };

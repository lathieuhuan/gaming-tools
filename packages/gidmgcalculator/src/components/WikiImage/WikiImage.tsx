import type { IconType } from "react-icons";
import { Image, type ImageProps } from "rond";
import { FaUser, FaQuestion } from "react-icons/fa";
import { RiSwordFill } from "react-icons/ri";
import { getImgSrc } from "@Src/utils";

const ICONS_BY_TYPE: Record<string, IconType> = {
  character: FaUser,
  weapon: RiSwordFill,
  artifact: FaQuestion,
};

interface WikiImageProps extends ImageProps {
  imgType?: "character" | "weapon" | "artifact";
}
export function WikiImage({ src, imgType, ...rest }: WikiImageProps) {
  const config: Pick<ImageProps, "showFallbackOnError" | "fallback"> = {
    showFallbackOnError: false,
    fallback: undefined,
  };

  if (imgType) {
    const Fallback = ICONS_BY_TYPE[imgType];

    config.showFallbackOnError = true;
    config.fallback = <Fallback />;
  }

  return <Image src={getImgSrc(src)} {...config} {...rest} />;
}

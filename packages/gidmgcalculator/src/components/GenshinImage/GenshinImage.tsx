import { getImgSrc } from "@/utils/getImgSrc";
import { Image, type DefaultImageFallbackProps, type ImageProps } from "rond";

type GenshinImageProps = Omit<ImageProps, "fallback" | "defaultFallbackProps"> & {
  /** Default 'unknown' */
  imgType?: DefaultImageFallbackProps["type"];
  fallbackCls?: string;
};

export function GenshinImage({
  src,
  imgType = "unknown",
  fallbackCls,
  ...rest
}: GenshinImageProps) {
  return (
    <Image
      src={getImgSrc(src)}
      showFallbackOnError
      defaultFallbackProps={{ type: imgType, className: fallbackCls }}
      {...rest}
    />
  );
}

import type { ClassValue } from "clsx";
import { useState } from "react";
import { cn } from "@lib/utils";
import { useRondConfig } from "../../providers/ConfigProvider";

export type ImageProps = {
  src?: string;
  alt?: string;
  className?: ClassValue;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  /** Default false */
  draggable?: boolean;
  /** Default true */
  showFallbackOnError?: boolean;
  defaultFallback?: Record<string, unknown>;
  imgCls?: ClassValue;
  imgStyle?: React.CSSProperties;
  fallback?: React.ReactNode;
  title?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};

export const Image = ({
  src,
  alt,
  className,
  style,
  draggable = false,
  width,
  height,
  showFallbackOnError = true,
  defaultFallback,
  imgCls,
  imgStyle,
  fallback,
  title,
  onError,
}: ImageProps) => {
  const [isError, setIsError] = useState(false);
  const { ImageFallback } = useRondConfig();
  const showFallback = isError && showFallbackOnError;

  return (
    <div
      title={title}
      className={cn("ron-image", isError && "ron-image-error", className)}
      style={{
        ...style,
        width,
        height,
      }}
    >
      {showFallback ? fallback ?? <ImageFallback {...defaultFallback} /> : null}
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-auto align-middle", showFallback && "hidden", imgCls)}
        style={imgStyle}
        draggable={draggable}
        onError={(e) => {
          setIsError(true);
          onError?.(e);
        }}
        onLoad={() => {
          if (isError) setIsError(false);
        }}
      />
    </div>
  );
};

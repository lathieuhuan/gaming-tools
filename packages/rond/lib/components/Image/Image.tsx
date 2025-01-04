import clsx, { type ClassValue } from "clsx";
import { useState } from "react";
import { useRondConfig } from "../../providers/ConfigProvider";
import "./Image.styles.scss";

export interface ImageProps {
  src?: string;
  alt?: string;
  className?: ClassValue;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  /** Default to false */
  draggable?: boolean;
  /** Default to true */
  showFallbackOnError?: boolean;
  defaultFallback?: Record<string, unknown>;
  imgCls?: ClassValue;
  imgStyle?: React.CSSProperties;
  fallback?: React.ReactNode;
  title?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}
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
      className={clsx("ron-image", isError && "ron-image-error", className)}
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
        className={clsx("ron-image__img", isError && "ron-image__img--error", showFallback && "ron-hidden", imgCls)}
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
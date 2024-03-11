import clsx, { type ClassValue } from "clsx";
import { useState } from "react";
import type { CSSProperties, SyntheticEvent } from "react";
import "./Image.styles.scss";

export interface ImageProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  width?: string | number;
  height?: string | number;
  /** Default to false */
  draggable?: boolean;
  /** Default to true */
  showFallbackOnError?: boolean;
  defaultFallback?: {
    cls?: ClassValue;
    style?: CSSProperties;
    /** Default to '70%' */
    iconWidth?: string | number;
    iconHeight?: string | number;
  };
  imgCls?: ClassValue;
  fallback?: React.ReactNode;
  onError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
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
  fallback,
  onError,
}: ImageProps) => {
  const [isError, setIsError] = useState(false);
  const showFallback = isError && showFallbackOnError;

  return (
    <div
      className={clsx("ron-image", isError && "ron-image-error", className)}
      style={{
        ...style,
        width,
        height,
      }}
    >
      {showFallback
        ? fallback ?? (
            <div
              className={clsx("ron-image-default-fallback ron-flex-center", defaultFallback?.cls)}
              style={defaultFallback?.style}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 384 512"
                width={defaultFallback?.iconWidth ?? "70%"}
                height={defaultFallback?.iconHeight}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M202.021 0C122.202 0 70.503 32.703 29.914 91.026c-7.363 10.58-5.093 25.086 5.178 32.874l43.138 32.709c10.373 7.865 25.132 6.026 33.253-4.148 25.049-31.381 43.63-49.449 82.757-49.449 30.764 0 68.816 19.799 68.816 49.631 0 22.552-18.617 34.134-48.993 51.164-35.423 19.86-82.299 44.576-82.299 106.405V320c0 13.255 10.745 24 24 24h72.471c13.255 0 24-10.745 24-24v-5.773c0-42.86 125.268-44.645 125.268-160.627C377.504 66.256 286.902 0 202.021 0zM192 373.459c-38.196 0-69.271 31.075-69.271 69.271 0 38.195 31.075 69.27 69.271 69.27s69.271-31.075 69.271-69.271-31.075-69.27-69.271-69.27z"></path>
              </svg>
            </div>
          )
        : null}
      <img
        src={src}
        alt={alt}
        className={clsx("ron-image-img", isError && "ron-image-img-error", showFallback && "ron-hidden", imgCls)}
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

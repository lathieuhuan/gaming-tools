import { createContext, useContext } from "react";

export type ScreenSize = "xs" | "sm" | "md" | "xm" | "lg" | "xl" | "2xl";

export type ScreenSizeContextType = {
  screenSize: ScreenSize;
  isFromSize: (size: ScreenSize) => boolean;
};

export const SCREEN_SIZE_MAP: Record<ScreenSize, number> = {
  xs: 320,
  sm: 480,
  md: 640,
  xm: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export function getScreenSize(): ScreenSize {
  const width = window.innerWidth;

  if (width >= SCREEN_SIZE_MAP["2xl"]) return "2xl";
  if (width >= SCREEN_SIZE_MAP.xl) return "xl";
  if (width >= SCREEN_SIZE_MAP.lg) return "lg";
  if (width >= SCREEN_SIZE_MAP.xm) return "xm";
  if (width >= SCREEN_SIZE_MAP.md) return "md";
  if (width >= SCREEN_SIZE_MAP.sm) return "sm";
  return "xs";
}

export const ScreenSizeContext = createContext<ScreenSizeContextType>({
  screenSize: getScreenSize(),
  isFromSize: () => true,
});

export function useScreenWatcher(isFromSize: ScreenSize): boolean;
export function useScreenWatcher(): ScreenSizeContextType;
export function useScreenWatcher(isFromSize?: ScreenSize): ScreenSizeContextType | boolean {
  const context = useContext(ScreenSizeContext);
  return isFromSize ? context.isFromSize(isFromSize) : context;
}

import { createContext, useContext, useEffect, useState } from "react";

type ScreenSize = "xs" | "sm" | "md" | "xm" | "lg" | "xl" | "2xl";

type ScreenSizeContextValue = {
  screenSize: ScreenSize;
  isFromSize: (size: ScreenSize) => boolean;
  isToSize: (size: ScreenSize) => boolean;
};

const SCREEN_SIZE_MAP: Record<ScreenSize, number> = {
  xs: 320,
  sm: 480,
  md: 640,
  xm: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const getScreenSize = (): ScreenSize => {
  const width = window.innerWidth;

  if (width >= SCREEN_SIZE_MAP["2xl"]) return "2xl";
  if (width >= SCREEN_SIZE_MAP.xl) return "xl";
  if (width >= SCREEN_SIZE_MAP.lg) return "lg";
  if (width >= SCREEN_SIZE_MAP.xm) return "xm";
  if (width >= SCREEN_SIZE_MAP.md) return "md";
  if (width >= SCREEN_SIZE_MAP.sm) return "sm";
  return "xs";
};

const ScreenSizeContext = createContext<ScreenSizeContextValue>({
  screenSize: getScreenSize(),
  isFromSize: () => true,
  isToSize: () => true,
});

export function ScreenSizeWatcher(props: { children: React.ReactNode }) {
  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize);

  useEffect(() => {
    document.body.setAttribute("data-screen", screenSize);
  }, [screenSize]);

  useEffect(() => {
    const handleResize = () => {
      const newScreenSize = getScreenSize();
      const currentScreenSize = document.body.getAttribute("data-screen");

      if (newScreenSize !== currentScreenSize) {
        setScreenSize(newScreenSize);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isFromSize: ScreenSizeContextValue["isFromSize"] = (size) => {
    const minWidth = SCREEN_SIZE_MAP[size];
    return window.innerWidth >= minWidth;
  };

  const isToSize: ScreenSizeContextValue["isToSize"] = (size) => {
    const minWidth = SCREEN_SIZE_MAP[size];
    return window.innerWidth <= minWidth;
  };

  return (
    <ScreenSizeContext.Provider
      value={{
        screenSize,
        isFromSize,
        isToSize,
      }}
    >
      {props.children}
    </ScreenSizeContext.Provider>
  );
}

export function useScreenWatcher() {
  return useContext(ScreenSizeContext);
}

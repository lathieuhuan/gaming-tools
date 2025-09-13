import { useEffect, useState } from "react";
import { getScreenSize, SCREEN_SIZE_MAP, ScreenSize, ScreenSizeContext, ScreenSizeContextType } from "./context";

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

  const isFromSize: ScreenSizeContextType["isFromSize"] = (size) => {
    const minWidth = SCREEN_SIZE_MAP[size];
    return window.innerWidth >= minWidth;
  };

  return (
    <ScreenSizeContext.Provider
      value={{
        screenSize,
        isFromSize,
      }}
    >
      {props.children}
    </ScreenSizeContext.Provider>
  );
}

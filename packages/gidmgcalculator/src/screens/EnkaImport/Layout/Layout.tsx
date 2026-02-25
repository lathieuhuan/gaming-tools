import { ReactNode, useRef } from "react";
import { clsx } from "rond";
import { LayoutContext } from "./context";
import { EnkaImportSection } from "../types";

export const MOBILE_SECTION_CLASS = "w-full shrink-0 snap-center";

type LayoutProps = {
  isMobile: boolean;
  children: ReactNode;
};

export function Layout({ isMobile, children }: LayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const goToSection = (section: EnkaImportSection) => {
    if (!isMobile) {
      return;
    }

    const sectionIndex = ["COVER", "RESULTS", "DETAIL"].indexOf(section);

    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.clientWidth * sectionIndex,
        behavior: "smooth",
      });
    }
  };

  return (
    <LayoutContext.Provider value={{ isMobile, goToSection }}>
      <div
        ref={containerRef}
        className={clsx(
          "h-full flex bg-dark-2",
          isMobile && "hide-scrollbar snap-x snap-mandatory"
        )}
      >
        {children}
      </div>
    </LayoutContext.Provider>
  );
}

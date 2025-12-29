import { ReactNode, useRef } from "react";
import { clsx } from "rond";
import { ContainerContext } from "./_context";
import { EnkaImportSection } from "../types";

export const MOBILE_SECTION_CLASS = "w-full shrink-0 snap-center";

type ContainerProps = {
  isMobile: boolean;
  children: ReactNode;
};

export function Container({ isMobile, children }: ContainerProps) {
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
    <ContainerContext.Provider value={{ isMobile, goToSection }}>
      <div
        ref={containerRef}
        className={clsx(
          "h-full flex bg-dark-2",
          isMobile && "hide-scrollbar snap-x snap-mandatory"
        )}
      >
        {children}
      </div>
    </ContainerContext.Provider>
  );
}

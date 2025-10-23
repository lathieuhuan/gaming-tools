import { useRef } from "react";
import { clsx, useScreenWatcher } from "rond";

import { EnkaSvg } from "@/components/icons/EnkaSvg";
import { TabHeader } from "./_components/TabHeader";
import { AccountInfo } from "./AccountInfo";
import { DataImportProvider } from "./DataImportProvider";
import { DetailSection } from "./DetailSection";
import { ResultsSection } from "./ResultsSection";
import { SaverProvider } from "./SaverProvider";
import { SearchBar } from "./SearchBar";

const MOBILE_TAB_CLASS = "w-full shrink-0 snap-center";

export function EnkaImport() {
  const isMobile = !useScreenWatcher("sm");
  const containerRef = useRef<HTMLDivElement>(null);

  /** Mobile only */
  const scrollToTabNo = (no: number) => {
    if (!isMobile) {
      return;
    }

    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.clientWidth * no,
        behavior: "smooth",
      });
    }
  };


  return (
    <DataImportProvider onSelectBuild={() => scrollToTabNo(2)}>
      <div
        ref={containerRef}
        className={clsx(
          "h-full flex bg-dark-2",
          isMobile && "hide-scrollbar snap-x snap-mandatory"
        )}
      >
        <div
          className={clsx(
            "p-4 flex flex-col gap-6 shrink-0 overflow-auto",
            isMobile ? MOBILE_TAB_CLASS : "w-85"
          )}
        >
          <div className="flex justify-between">
            <TabHeader sub="Use in-game UID">
              <h2 className="font-bold text-heading">Import data</h2>
            </TabHeader>

            <div className="flex flex-col items-end">
              <p className="text-light-hint text-sm">Powered by</p>
              <a
                className="text-light-2 flex items-center gap-1"
                href="https://enka.network"
                target="_blank"
              >
                <EnkaSvg className="text-xl" />
                <span className="text-lg font-bold">Enka.Network</span>
              </a>
            </div>
          </div>

          <SearchBar />

          <AccountInfo isMobile={isMobile} onSeeBuilds={() => scrollToTabNo(1)} />
        </div>

        <SaverProvider>
          <ResultsSection
            className={clsx("p-4 h-full custom-scrollbar", isMobile && MOBILE_TAB_CLASS)}
            isMobile={isMobile}
            onBack={() => scrollToTabNo(0)}
          />

          <DetailSection
            className={clsx("p-4", isMobile ? MOBILE_TAB_CLASS : "w-80")}
            isMobile={isMobile}
            onBack={() => scrollToTabNo(1)}
          />
        </SaverProvider>
      </div>
    </DataImportProvider>
  );
}

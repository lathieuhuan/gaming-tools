import { useRef } from "react";
import { clsx } from "rond";

import { useRouter } from "@Src/features";
import { useGenshinUser } from "@Src/hooks/queries/useGenshinUser";
import { useSelector } from "@Store/hooks";
import { selectIsAppReady } from "@Store/ui-slice";
import { SearchParams } from "./types";

import { ResultsSection } from "./ResultsSection";
import { SearchBar, SearchBarProps } from "./SearchBar";

type EnkaImportProps = {
  isMobile?: boolean;
};

export function EnkaImport({ isMobile }: EnkaImportProps) {
  const router = useRouter<SearchParams>();
  const isAppReady = useSelector(selectIsAppReady);
  const containerRef = useRef<HTMLDivElement>(null);

  const { user, isLoading } = useGenshinUser(router.searchParams?.uid, { enable: isAppReady });

  const handleSearch: SearchBarProps["onSearch"] = (input) => {
    router.updateSearchParams({ [input.type]: input.value }, true);

    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="h-full p-4 pb-2 bg-surface-2">
      <div
        ref={containerRef}
        className={clsx("h-full pb-2 flex gap-4 custom-scrollbar", isMobile && "snap-x snap-mandatory")}
      >
        <div className={clsx("h-full flex flex-col shrink-0 overflow-auto", isMobile ? "w-full snap-center" : "w-80")}>
          <div>
            <h2 className="text-lg font-bold">Import characters</h2>
            <p className="text-sm text-hint-color">Use in-game UID or enka profile</p>
          </div>

          <SearchBar className="mt-6" searchParams={router.searchParams} onSearch={handleSearch} />
        </div>

        <div className={clsx(isMobile && "w-full snap-center")}>
          <ResultsSection className="h-full" user={user} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

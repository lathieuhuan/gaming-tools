import { useEffect, useRef } from "react";
import { clsx, notification, useScreenWatcher } from "rond";

import { useGenshinUser } from "@/hooks/queries/useGenshinUser";
import { useRouter } from "@/systems/router";
import { useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";
import { SearchParams } from "./types";

import { ResultsSection } from "./ResultsSection";
import { Input, SearchBar, SearchBarProps } from "./SearchBar";

function getInitialInput(params?: SearchParams): Input {
  if (params?.uid) {
    return { type: "uid", value: params.uid };
  }
  if (params?.profile) {
    return { type: "profile", value: params.profile };
  }
  return { type: "uid", value: "" };
}

export function EnkaImport() {
  const router = useRouter<SearchParams>();
  const isMobile = !useScreenWatcher("sm");
  const appReady = useSelector(selectAppReady);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: user,
    isLoading,
    error,
  } = useGenshinUser(router.searchParams?.uid, {
    enabled: appReady,
  });

  useEffect(() => {
    if (error) {
      notification.error({
        content: error.message,
      });
    }
  }, [error]);

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

          <SearchBar className="mt-6" initialInput={getInitialInput(router.searchParams)} onSearch={handleSearch} />
        </div>

        <div className={clsx(isMobile && "w-full shrink-0 snap-center")}>
          <ResultsSection className="h-full" user={user} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

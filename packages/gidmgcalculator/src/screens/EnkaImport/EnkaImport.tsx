import { useEffect, useRef } from "react";
import { clsx, notification, useScreenWatcher } from "rond";

import { useRouter } from "@/systems/router";
import { useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";
import { useGenshinUser } from "./_hooks/useGenshinUser";
import { SearchParams } from "./types";

import { SelectedBuildProvider } from "./SelectedBuildProvider";
import { DetailSection } from "./DetailSection";
import { ResultsSection } from "./ResultsSection";
import { SearchBar, SearchBarProps, SearchInput } from "./SearchBar";

const MOBILE_TAB_CLASS = "w-full shrink-0 snap-center";

function getInitialInput(params?: SearchParams): SearchInput {
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

  const handleSearch: SearchBarProps["onSearch"] = (input) => {
    router.updateSearchParams({ [input.type]: input.value }, true);
    scrollToTabNo(1);
  };

  const handleSelectBuild = () => {
    scrollToTabNo(2);
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "h-full flex bg-dark-2",
        isMobile ? "hide-scrollbar snap-x snap-mandatory" : "gap-4"
      )}
    >
      <div
        className={clsx(
          "p-4 flex flex-col shrink-0 overflow-auto",
          isMobile ? MOBILE_TAB_CLASS : "w-80"
        )}
      >
        <div>
          <h2 className="text-lg font-bold">Import characters</h2>
          <p className="text-sm text-light-hint">use in-game UID or enka profile</p>
        </div>

        <SearchBar
          className="mt-6"
          initialInput={getInitialInput(router.searchParams)}
          searching={isLoading}
          onSearch={handleSearch}
        />
      </div>

      <SelectedBuildProvider onSelectBuild={handleSelectBuild}>
        <ResultsSection
          className={clsx("p-4 h-full custom-scrollbar", isMobile && MOBILE_TAB_CLASS)}
          user={user}
          isLoading={isLoading}
          onBack={() => scrollToTabNo(0)}
        />

        <DetailSection
          className={clsx("p-4", isMobile && MOBILE_TAB_CLASS)}
          isMobile={isMobile}
          onBack={() => scrollToTabNo(1)}
        />
      </SelectedBuildProvider>
    </div>
  );
}

import { clsx, Skeleton, useScreenWatcher } from "rond";

import type { GenshinUserBuild } from "@/services/enka";
import { BuildOverview, BuildOverviewMobile } from "./BuildOverview";

type BuildOverviewsProps = {
  className?: string;
  builds?: GenshinUserBuild[];
  isLoading?: boolean;
  onSave?: (build: GenshinUserBuild) => void;
  onCalculate?: (build: GenshinUserBuild) => void;
};

export function BuildOverviews({
  className,
  builds,
  isLoading,
  onSave,
  onCalculate,
}: BuildOverviewsProps) {
  const isMobile = !useScreenWatcher("sm");
  const OverviewComponent = isMobile ? BuildOverviewMobile : BuildOverview;

  if (isLoading) {
    return (
      <div className={clsx("space-y-2", className)}>
        <Skeleton className="h-44 rounded-lg" />
        <Skeleton className="h-44 rounded-lg" />
      </div>
    );
  }

  if (builds?.length) {
    return (
      <div className={clsx("space-y-2", className)}>
        {builds.map((build, index) => {
          return (
            <OverviewComponent
              key={index}
              build={build}
              onSave={() => onSave?.(build)}
              onCalculate={() => onCalculate?.(build)}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={clsx("p-4 py-6 flex-center", className)}>
      <p className="text-light-hint">No results found</p>
    </div>
  );
}

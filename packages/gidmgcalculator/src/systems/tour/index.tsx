import { useUIStore } from "@Store/ui";
import { Suspense } from "react";

import { TourGuide } from "./TourGuide";
import { TourLoading } from "./TourLoading";

// const TourGuide = lazy(() => import("./TourGuide").then((mod) => ({ default: mod.TourGuide })));

export const TourOperator = () => {
  const tourType = useUIStore((state) => state.tourType);

  return (
    tourType && (
      <Suspense fallback={<TourLoading />}>
        <TourGuide type={tourType} />
      </Suspense>
    )
  );
};

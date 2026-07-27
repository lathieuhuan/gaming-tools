import { Suspense } from "react";
import { LoadingPlate } from "rond";
import { TourOperator as Operator } from "@/lib/tour-operator";

import { useUIStore } from "@Store/ui";

// const Operator = lazy(() =>
//   import("@/lib/tour-operator").then((module) => ({ default: module.TourOperator })),
// );

export function TourOperator() {
  const tourType = useUIStore((state) => state.tourType);

  return (
    tourType && (
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-black/40 flex-center">
            <LoadingPlate />
          </div>
        }
      >
        <Operator tourType={tourType} />
      </Suspense>
    )
  );
}

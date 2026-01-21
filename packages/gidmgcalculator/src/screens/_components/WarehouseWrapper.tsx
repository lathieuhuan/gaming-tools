import { Fragment, ReactElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingPlate, WarehouseLayout } from "rond";

import { useTravelerKey } from "@/hooks";
import { selectAppReady, useUIStore } from "@Store/ui";
import { WarehouseError } from "./WarehouseError";

type WarehouseWrapperProps = {
  children: ReactElement;
};

export function WarehouseWrapper({ children }: WarehouseWrapperProps) {
  const appReady = useUIStore(selectAppReady);
  const [travelerKey] = useTravelerKey();

  if (!appReady) {
    return (
      <WarehouseLayout className="h-full relative">
        <div className="absolute inset-0 flex-center">
          <LoadingPlate />
        </div>
      </WarehouseLayout>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={WarehouseError}>
      <Fragment key={travelerKey}>{children}</Fragment>
    </ErrorBoundary>
  );
}

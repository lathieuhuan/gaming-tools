import { Fragment, ReactElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingPlate, WarehouseLayout } from "rond";

import { useTravelerKey } from "@/hooks";
import { useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";
import { WarehouseError } from "./WarehouseError";

type WarehouseWrapperProps = {
  children: ReactElement;
};

export function WarehouseWrapper({ children }: WarehouseWrapperProps) {
  const appReady = useSelector(selectAppReady);
  const travelerKey = useTravelerKey();

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

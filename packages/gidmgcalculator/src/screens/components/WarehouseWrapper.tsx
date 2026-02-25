import { ReactElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingPlate, WarehouseLayout } from "rond";

import { selectAppReady, useUIStore } from "@Store/ui";
import { WarehouseError } from "./WarehouseError";

type WarehouseWrapperProps = {
  children: ReactElement;
};

export function WarehouseWrapper({ children }: WarehouseWrapperProps) {
  const appReady = useUIStore(selectAppReady);

  if (!appReady) {
    return (
      <WarehouseLayout className="h-full relative">
        <div className="absolute inset-0 flex-center">
          <LoadingPlate />
        </div>
      </WarehouseLayout>
    );
  }

  return <ErrorBoundary FallbackComponent={WarehouseError}>{children}</ErrorBoundary>;
}

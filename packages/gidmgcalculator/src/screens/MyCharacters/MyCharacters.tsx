import { ErrorBoundary } from "react-error-boundary";
import { LoadingPlate, useScreenWatcher } from "rond";

import { selectAppReady, useUIStore } from "@Store/ui";

import { WarehouseError } from "../components/WarehouseError";
import { MyCharactersLarge } from "./MyCharactersLarge";
import { MyCharactersSmall } from "./MyCharactersSmall";

export function MyCharacters() {
  const screenWatcher = useScreenWatcher();
  const isMobile = !screenWatcher.isFromSize("sm");
  const appReady = useUIStore(selectAppReady);

  if (!appReady) {
    return (
      <div className="h-full bg-dark-3 flex-center">
        <LoadingPlate />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={WarehouseError}>
      {isMobile ? <MyCharactersSmall /> : <MyCharactersLarge />}
    </ErrorBoundary>
  );
}

import { ErrorBoundary } from "react-error-boundary";
import { LoadingPlate, useScreenWatcher } from "rond";

import { useTravelerKey } from "@/hooks";
import { selectAppReady, useUIStore } from "@Store/ui";

import { WarehouseError } from "../_components/WarehouseError";
import { MyCharactersLarge } from "./MyCharactersLarge";
import { MyCharactersSmall } from "./MyCharactersSmall";

export function MyCharacters() {
  const screenWatcher = useScreenWatcher();
  const isMobile = !screenWatcher.isFromSize("sm");
  const appReady = useUIStore(selectAppReady);
  const travelerKey = useTravelerKey();

  if (!appReady) {
    return (
      <div className="h-full bg-dark-3 flex-center">
        <LoadingPlate />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={WarehouseError}>
      {isMobile ? <MyCharactersSmall key={travelerKey} /> : <MyCharactersLarge key={travelerKey} />}
    </ErrorBoundary>
  );
}

import { LoadingPlate, useScreenWatcher } from "rond";

import { useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";

import { MyCharactersLarge } from "./MyCharactersLarge";
import { MyCharactersSmall } from "./MyCharactersSmall";

export function MyCharacters() {
  const screenWatcher = useScreenWatcher();
  const isMobile = !screenWatcher.isFromSize("sm");
  const appReady = useSelector(selectAppReady);

  if (!appReady) {
    return (
      <div className="h-full flex flex-col bg-surface-3 flex-center">
        <LoadingPlate />
      </div>
    );
  }

  return isMobile ? <MyCharactersSmall /> : <MyCharactersLarge />;
}

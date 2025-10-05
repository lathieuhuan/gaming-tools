import { LoadingPlate, useScreenWatcher } from "rond";

import { useTravelerKey } from "@/hooks";
import { useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";

import { MyCharactersLarge } from "./MyCharactersLarge";
import { MyCharactersSmall } from "./MyCharactersSmall";

export function MyCharacters() {
  const screenWatcher = useScreenWatcher();
  const isMobile = !screenWatcher.isFromSize("sm");
  const appReady = useSelector(selectAppReady);
  const travelerKey = useTravelerKey();

  if (!appReady) {
    return (
      <div className="h-full flex flex-col bg-dark-3 flex-center">
        <LoadingPlate />
      </div>
    );
  }

  return isMobile ? <MyCharactersSmall key={travelerKey} /> : <MyCharactersLarge key={travelerKey} />;
}

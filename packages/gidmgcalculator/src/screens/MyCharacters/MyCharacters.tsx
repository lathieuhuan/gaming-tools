import { useScreenWatcher } from "rond";

import { MyCharactersLarge } from "./MyCharactersLarge";
import { MyCharactersSmall } from "./MyCharactersSmall";

export function MyCharacters() {
  const screenWatcher = useScreenWatcher();
  const isMobile = !screenWatcher.isFromSize("sm");

  return isMobile ? <MyCharactersSmall /> : <MyCharactersLarge />;
}

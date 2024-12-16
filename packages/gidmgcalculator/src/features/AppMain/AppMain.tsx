import { useScreenWatcher } from "rond";
import { AppMainLarge } from "./AppMainLarge/AppMainLarge";
import { AppMainSmall } from "./AppMainSmall/AppMainSmall";

export function AppMain() {
  const screenWatcher = useScreenWatcher();
  return screenWatcher.isFromSize("sm") ? <AppMainLarge /> : <AppMainSmall />;
}

import EnkaImport from "@Src/screens/EnkaImport";
import MyArtifacts from "@Src/screens/MyArtifacts";
import MyCharacters from "@Src/screens/MyCharacters";
import MySetups from "@Src/screens/MySetups";
import MyWeapons from "@Src/screens/MyWeapons";
import { RootRouteConfig } from "@Src/systems/router";

import { App } from "./App";
import { SCREEN_PATH } from "./config";

export const route: RootRouteConfig = {
  component: App,
  children: [
    {
      path: SCREEN_PATH.ENKA,
      component: EnkaImport,
    },
    {
      path: SCREEN_PATH.SETUPS,
      component: MySetups,
    },
    {
      path: SCREEN_PATH.ARTIFACTS,
      component: MyArtifacts,
    },
    {
      path: SCREEN_PATH.WEAPONS,
      component: MyWeapons,
    },
    {
      path: SCREEN_PATH.CHARACTERS,
      component: MyCharacters,
    },
  ],
};

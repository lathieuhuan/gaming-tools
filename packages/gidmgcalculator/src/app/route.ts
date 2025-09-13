import EnkaImport from "@/screens/EnkaImport";
import MyArtifacts from "@/screens/MyArtifacts";
import MyCharacters from "@/screens/MyCharacters";
import MySetups from "@/screens/MySetups";
import MyWeapons from "@/screens/MyWeapons";
import { RootRouteConfig } from "@/systems/router";

import { SCREEN_PATH } from "@/constants";
import { App } from "./App";

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

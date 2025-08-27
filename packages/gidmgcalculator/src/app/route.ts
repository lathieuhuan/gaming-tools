import MyArtifacts from "@Src/screens/MyArtifacts";
import MyCharacters from "@Src/screens/MyCharacters";
import MySetups from "@Src/screens/MySetups";
import MyWeapons from "@Src/screens/MyWeapons";
import { RootRouteConfig } from "@Src/systems/router";

import { App } from "./App";

export const route: RootRouteConfig = {
  component: App,
  children: [
    {
      path: "my-setups",
      component: MySetups,
    },
    {
      path: "my-artifacts",
      component: MyArtifacts,
    },
    {
      path: "my-weapons",
      component: MyWeapons,
    },
    {
      path: "my-characters",
      component: MyCharacters,
    },
  ],
};

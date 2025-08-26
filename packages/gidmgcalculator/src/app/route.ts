import MyArtifacts from "@Src/screens/MyArtifacts";
import { MyCharactersLarge } from "@Src/screens/MyCharacters";
import MySetups from "@Src/screens/MySetups";
import MyWeapons from "@Src/screens/MyWeapons";
import { RootRouteConfig } from "@Src/systems/router";

import { App } from "./App";
import { Main } from "./Main";

export const route: RootRouteConfig = {
  component: App,
  defaultChild: {
    component: Main,
  },
  children: [
    {
      path: "my-characters",
      component: MyCharactersLarge,
    },
    {
      path: "my-weapons",
      component: MyWeapons,
    },
    {
      path: "my-artifacts",
      component: MyArtifacts,
    },
    {
      path: "my-setups",
      component: MySetups,
    },
  ],
};

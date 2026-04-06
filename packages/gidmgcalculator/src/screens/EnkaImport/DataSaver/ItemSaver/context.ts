import { createContext, useContext } from "react";

import type { GenshinUserBuild } from "@/services/enka";
import type { ArtifactType } from "@/types";

export type ItemSaverContextState = (
  build: GenshinUserBuild,
  saveType: "WEAPON" | "ARTIFACTS" | ArtifactType
) => void;

export const ItemSaverContext = createContext<ItemSaverContextState>(() => {});

export const useRequestSaveItem = () => {
  return useContext(ItemSaverContext);
};

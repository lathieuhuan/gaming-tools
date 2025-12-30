import { createContext, useContext } from "react";
import { GenshinUserBuild } from "@/services/enka";

export type ItemSaverContextState = (
  build: GenshinUserBuild,
  saveType: "WEAPON" | "ARTIFACTS" | number
) => void;

export const ItemSaverContext = createContext<ItemSaverContextState>(() => {});

export const useRequestSaveItem = () => {
  return useContext(ItemSaverContext);
};

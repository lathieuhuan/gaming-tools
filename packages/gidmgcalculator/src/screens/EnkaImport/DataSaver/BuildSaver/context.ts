import { createContext, useContext } from "react";

import type { GenshinUserBuild } from "@/services/enka";

export type BuildSaverContextState = (build: GenshinUserBuild) => void;

export const BuildSaverContext = createContext<BuildSaverContextState>(() => {});

export const useRequestSaveBuild = () => {
  return useContext(BuildSaverContext);
};

import { createContext, useContext } from "react";

import { GenshinUserBuild } from "@/services/enka";

export type SaverContextState = {
  save: (build: GenshinUserBuild, type?: "WEAPON" | number) => void;
};

export const SaverContext = createContext<SaverContextState>({
  save: () => {},
});

export const useSaver = () => {
  return useContext(SaverContext);
};

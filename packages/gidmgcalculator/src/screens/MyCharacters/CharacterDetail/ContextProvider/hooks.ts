import { useContext } from "react";
import { DetailInfoContext } from "./DetailInfoProvider/DetailInfo.context";
import { DetailModalContext } from "./DetailModalProvider/DetailModal.context";

export function useDetailInfo() {
  return useContext(DetailInfoContext);
}

export function useDetailModalCtrl() {
  const context = useContext(DetailModalContext);
  if (!context) {
    throw new Error("useDetailModalCtrl must be used inside CharacterDetail/ContextProvider");
  }
  return context;
}

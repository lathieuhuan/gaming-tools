import { createContext, useContext } from "react";

export type MyCharacterDetailModalsControl = {
  requestSwitchCharacter: () => void;
  requestSwitchWeapon: () => void;
  requestSwitchArtifact: (index: number) => void;
  requestRemoveCharacter: () => void;
};

export const MyCharacterDetailModalsContext = createContext<MyCharacterDetailModalsControl | null>(null);

export function useMyCharacterDetailModalsCtrl() {
  const context = useContext(MyCharacterDetailModalsContext);
  if (!context) {
    throw new Error("useMyCharacterDetailModalsCtrl must be used inside CharacterInfoModalsContext");
  }
  return context;
}

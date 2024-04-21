import { createContext, useContext } from "react";

export type CharacterInfoModalsControl = {
  requestSwitchCharacter: () => void;
  requestSwitchWeapon: () => void;
  requestSwitchArtifact: (index: number) => void;
  requestRemoveCharacter: () => void;
};

export const CharacterInfoModalsContext = createContext<CharacterInfoModalsControl | null>(null);

export function useCharacterInfoModalCtrl() {
  const context = useContext(CharacterInfoModalsContext);
  if (!context) {
    throw new Error("useCharacterInfoModalCtrl must be used inside CharacterInfoModalsContext");
  }
  return context;
}

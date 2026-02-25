import { createContext, useContext } from "react";

export type ModalControl = {
  requestSortCharacters: () => void;
  requestAddCharacter: () => void;
};

export const ModalContext = createContext<ModalControl | null>(null);

export function useMyCharactersModalCtrl() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useMyCharactersModalCtrl must be used inside MyCharacters/ModalProvider");
  }
  return context;
}

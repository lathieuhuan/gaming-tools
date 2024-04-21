import { createContext, useContext } from "react";

export type MyCharactersModalsControl = {
  requestSortCharacters: () => void;
  requestAddCharacter: () => void;
};

export const MyCharactersModalsContext = createContext<MyCharactersModalsControl | null>(null);

export function useMyCharactersModalCtrl() {
  const context = useContext(MyCharactersModalsContext);
  if (!context) {
    throw new Error("useMyCharactersModalCtrl must be used inside MyCharactersModalsContext");
  }
  return context;
}

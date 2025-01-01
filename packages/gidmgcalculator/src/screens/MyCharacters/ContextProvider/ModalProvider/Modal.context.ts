import { createContext } from "react";

export type ModalControl = {
  requestSortCharacters: () => void;
  requestAddCharacter: () => void;
};

export const ModalContext = createContext<ModalControl | null>(null);

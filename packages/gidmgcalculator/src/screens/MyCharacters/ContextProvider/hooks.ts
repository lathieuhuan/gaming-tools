import { useContext } from "react";
import { ModalContext } from "./ModalProvider/Modal.context";

export function useMyCharactersModalCtrl() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useMyCharactersModalCtrl must be used inside MyCharacters/ModalProvider");
  }
  return context;
}

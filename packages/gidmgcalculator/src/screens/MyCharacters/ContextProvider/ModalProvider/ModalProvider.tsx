import { useMemo, useState } from "react";

import { addCharacter, selectUserCharacters, viewCharacter } from "@Store/userdb-slice";
import { useDispatch, useSelector } from "@Store/hooks";

// Component
import { Tavern } from "@/components";
import { ModalContext, type ModalControl } from "./Modal.context";
import { CharacterSort } from "./CharacterSort";

type ModalType = "ADD_CHARACTER" | "SORT_CHARACTERS" | "";

export function ModalProvider(props: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");
  const userChars = useSelector(selectUserCharacters);

  const closeModal = () => setModalType("");

  const control: ModalControl = useMemo(() => {
    return {
      requestAddCharacter: () => {
        setModalType("ADD_CHARACTER");
      },
      requestSortCharacters: () => {
        setModalType("SORT_CHARACTERS");
      },
    };
  }, []);

  return (
    <ModalContext.Provider value={control}>
      {props.children}

      <Tavern
        active={modalType === "ADD_CHARACTER"}
        sourceType="app"
        hasMultipleMode
        filter={(character) => userChars.every((userChar) => userChar.name !== character.name)}
        onSelectCharacter={(character) => {
          if (!userChars.length) {
            dispatch(viewCharacter(character.name));
          }
          dispatch(addCharacter(character));
        }}
        onClose={closeModal}
      />

      <CharacterSort active={modalType === "SORT_CHARACTERS"} onClose={closeModal} />
      {/*  */}
    </ModalContext.Provider>
  );
}

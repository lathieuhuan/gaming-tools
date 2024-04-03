import { useMemo, useState } from "react";

import { addCharacter, selectUserCharacters, viewCharacter } from "@Store/userdb-slice";
import { useDispatch, useSelector } from "@Store/hooks";

// Component
import { Tavern } from "@Src/components";
import { MyCharactersModalsContext, type MyCharactersModalsControl } from "./my-characters-modals-context";
import MyCharactersSort from "./MyCharactersSort";

type ModalType = "ADD_CHARACTER" | "SORT_CHARACTERS" | "";

export function MyCharactersModalsProvider(props: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");
  const userChars = useSelector(selectUserCharacters);

  const closeModal = () => setModalType("");

  const control: MyCharactersModalsControl = useMemo(() => {
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
    <MyCharactersModalsContext.Provider value={control}>
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

      <MyCharactersSort active={modalType === "SORT_CHARACTERS"} onClose={closeModal} />
    </MyCharactersModalsContext.Provider>
  );
}

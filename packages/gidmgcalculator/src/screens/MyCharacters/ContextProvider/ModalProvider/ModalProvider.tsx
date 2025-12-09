import { useId, useMemo, useState } from "react";
import { Modal } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { addCharacter, selectDbCharacters, viewCharacter } from "@Store/userdb-slice";
import { ModalContext, type ModalControl } from "./Modal.context";

// Component
import { Tavern } from "@/components";
import { CharacterSortForm } from "../../CharacterSortForm";

type ModalType = "ADD_CHARACTER" | "SORT_CHARACTERS" | "";

export function ModalProvider(props: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const sortFormId = useId();
  const [modalType, setModalType] = useState<ModalType>("");
  const [resetCount, setResetCount] = useState(0);
  const dbChars = useSelector(selectDbCharacters);

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
        filter={(character) => dbChars.every((dbChar) => dbChar.name !== character.name)}
        onSelectCharacter={({ data }) => {
          dispatch(addCharacter({ name: data.name, data }));

          if (!dbChars.length) {
            dispatch(viewCharacter(data.name));
          }
        }}
        onClose={closeModal}
      />

      <Modal
        active={modalType === "SORT_CHARACTERS"}
        preset="small"
        title="Sort characters"
        className="bg-dark-1"
        withActions
        moreActions={[
          {
            children: "Reset",
            onClick: () => setResetCount(resetCount + 1),
          },
        ]}
        formId={sortFormId}
        onClose={closeModal}
      >
        <CharacterSortForm key={resetCount} id={sortFormId} onClose={closeModal} />
      </Modal>
    </ModalContext.Provider>
  );
}

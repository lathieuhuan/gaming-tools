import { useState } from "react";
import { useScreenWatcher, Button } from "rond";
import { FaPlus } from "react-icons/fa";

// Store
import { selectChosenCharacter, selectUserCharacters, addCharacter, chooseCharacter } from "@Store/userdb-slice";
import { useDispatch, useSelector } from "@Store/hooks";

// Component
import { Tavern } from "@Src/components";
import CharacterSort from "./CharacterSort";
import CharacterList from "./CharacterList";
import CharacterInfo from "./CharacterInfo";

type ModalType = "ADD_CHARACTER" | "SORT_CHARACTERS" | "";

export default function MyCharacters() {
  return (
    <div className="h-full flex flex-col bg-surface-3">
      <Header />

      <div className="grow overflow-auto">
        <CharacterInfo />
      </div>
    </div>
  );
}

function Header() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const chosenChar = useSelector(selectChosenCharacter);
  const userChars = useSelector(selectUserCharacters);

  const [modalType, setModalType] = useState<ModalType>("");

  const closeModal = () => {
    setModalType("");
  };

  const renderAddCharacterButton = (cls = "") => (
    <Button
      variant="custom"
      size="custom"
      className={`w-full h-full bg-surface-3 ${cls}`}
      icon={<FaPlus />}
      onClick={() => setModalType("ADD_CHARACTER")}
    />
  );

  return (
    <>
      {screenWatcher.isFromSize("md") ? (
        <CharacterList
          characters={userChars}
          chosenChar={chosenChar}
          addCharacterButton={renderAddCharacterButton("text-2xl")}
          onClickSort={() => setModalType("SORT_CHARACTERS")}
          onClickWish={() => setModalType("ADD_CHARACTER")}
        />
      ) : (
        <div className="py-4 flex justify-center bg-surface-2">
          <div className="flex justify-between" style={{ width: "80%" }}>
            <span />

            {userChars.length ? (
              <select
                className="styled-select py-0 text-1.5xl leading-base text-center text-last-center"
                value={chosenChar}
                onChange={(e) => dispatch(chooseCharacter(e.target.value))}
              >
                {userChars.map((userChar, i) => (
                  <option key={i}>{userChar.name}</option>
                ))}
              </select>
            ) : null}

            <div style={{ width: "3rem", height: "3rem" }}>{renderAddCharacterButton("text-xl")}</div>
          </div>
        </div>
      )}

      <Tavern
        active={modalType === "ADD_CHARACTER"}
        sourceType="app"
        hasMultipleMode
        filter={(character) => userChars.every((userChar) => userChar.name !== character.name)}
        onSelectCharacter={(character) => {
          if (!userChars.length) {
            dispatch(chooseCharacter(character.name));
          }
          dispatch(addCharacter(character));
        }}
        onClose={closeModal}
      />

      <CharacterSort active={modalType === "SORT_CHARACTERS"} onClose={closeModal} />
    </>
  );
}

import { useState } from "react";
import { useScreenWatcher, Button } from "rond";

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
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const chosenChar = useSelector(selectChosenCharacter);
  const userChars = useSelector(selectUserCharacters);

  const [modalType, setModalType] = useState<ModalType>("");

  const closeModal = () => {
    setModalType("");
  };

  return (
    <div className="h-full flex flex-col bg-surface-3">
      {screenWatcher.isFromSize("md") ? (
        <CharacterList
          characters={userChars}
          chosenChar={chosenChar}
          onClickSort={() => setModalType("SORT_CHARACTERS")}
          onClickWish={() => setModalType("ADD_CHARACTER")}
        />
      ) : (
        <div className="py-4 flex bg-surface-2">
          {userChars.length ? (
            <div className="w-full flex-center relative">
              <select
                className="styled-select py-0 text-1.5xl leading-base text-center text-last-center"
                value={chosenChar}
                onChange={(e) => dispatch(chooseCharacter(e.target.value))}
              >
                {userChars.map((userChar, i) => (
                  <option key={i}>{userChar.name}</option>
                ))}
              </select>
              <Button className="ml-6" variant="primary" onClick={() => setModalType("ADD_CHARACTER")}>
                Add
              </Button>
            </div>
          ) : (
            <Button className="mx-auto" variant="primary" onClick={() => setModalType("ADD_CHARACTER")}>
              Add new characters
            </Button>
          )}
        </div>
      )}

      <div className="grow flex-center overflow-y-auto">
        <div className="w-full h-full flex justify-center">{userChars.length ? <CharacterInfo /> : null}</div>
      </div>

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
    </div>
  );
}

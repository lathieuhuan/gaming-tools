import type { RootState } from "@Store/store";

import { makeCharacterCalcFromDb } from "@/logic/userdb.logic";
import { useSelector } from "@Store/hooks";
import { ActionProvider } from "./ActionProvider";
import { ActiveCharContext } from "./context";

const parseUserdb = (state: RootState) => {
  const { userChars, userWps, userArts, chosenChar } = state.userdb;
  const activeCharacter = userChars.find((char) => char.code === chosenChar);
  const charCount = userChars.length;

  if (!activeCharacter) {
    return {
      character: null,
      charCount,
    };
  }

  const character = makeCharacterCalcFromDb(activeCharacter, userWps, userArts).initCalculation();

  character.allAttrsCtrl.finalize();

  return {
    character,
    charCount,
  };
};

export function ActiveCharProvider(props: { children: React.ReactNode }) {
  const { charCount, character } = useSelector(parseUserdb);

  if (charCount) {
    return character ? (
      <ActiveCharContext.Provider value={character}>
        <ActionProvider character={character}>{props.children}</ActionProvider>
      </ActiveCharContext.Provider>
    ) : null;
  }

  return (
    <div className="pt-8">
      <p className="text-center text-lg text-light-hint">No characters found</p>
    </div>
  );
}

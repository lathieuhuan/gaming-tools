import type { RootState } from "@Store/store";

import Array_ from "@/utils/Array";
import { makeCharacterCalcFromDb } from "@/utils/userdb";
import { useSelector } from "@Store/hooks";
import { ActionProvider } from "./ActionProvider";
import { ActiveCharContext } from "./_context";

const parseUserdb = (state: RootState) => {
  const { userChars, userWps, userArts, chosenChar } = state.userdb;
  const activeCharacter = Array_.findByName(userChars, chosenChar);
  const charCount = userChars.length;

  if (!activeCharacter) {
    return {
      character: null,
      charCount,
    };
  }

  const character = makeCharacterCalcFromDb(activeCharacter, userWps, userArts).initCalc();

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

import { useScreenWatcher } from "rond";

import type { RootState } from "@Store/store";
import { findById, findByName } from "@Src/utils";
import { useSelector } from "@Store/hooks";

// Component
import { CharacterInfoProvider } from "./CharacterInfoProvider";
import { CharacterInfoModalsProvider } from "./CharacterInfoModalsProvider";
import { CharacterInfoLarge } from "./CharacterInfoLarge";
import { CharacterInfoSmall } from "./CharacterInfoSmall";

const selectChosenCharacterInfo = (state: RootState) => {
  const { userChars, userWps, userArts, chosenChar } = state.userdb;
  const chosenCharInfo = findByName(userChars, chosenChar);
  const weapon = findById(userWps, chosenCharInfo?.weaponID);

  if (chosenCharInfo && weapon) {
    const { weaponID, artifactIDs, ...char } = chosenCharInfo;

    return {
      char,
      weapon,
      artifacts: artifactIDs.map((id) => (id ? findById(userArts, id) ?? null : null)),
    };
  }
  return null;
};

export default function CharacterInfo() {
  const screenWatcher = useScreenWatcher();
  const chosenCharacterInfo = useSelector(selectChosenCharacterInfo);

  if (!chosenCharacterInfo) return null;

  return (
    <CharacterInfoProvider {...chosenCharacterInfo}>
      <CharacterInfoModalsProvider>
        {screenWatcher.isFromSize("sm") ? (
          <CharacterInfoLarge char={chosenCharacterInfo.char} />
        ) : (
          <CharacterInfoSmall char={chosenCharacterInfo.char} />
        )}
      </CharacterInfoModalsProvider>
    </CharacterInfoProvider>
  );
}

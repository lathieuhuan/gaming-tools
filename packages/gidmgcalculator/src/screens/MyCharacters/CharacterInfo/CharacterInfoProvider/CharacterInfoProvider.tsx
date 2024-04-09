import { useMemo } from "react";
import type { Character, UserArtifacts, UserWeapon } from "@Src/types";

import { useAppCharacter } from "@Src/hooks";
import { getCalculationStats } from "@Src/calculation";
import { $AppData } from "@Src/services";
import { Calculation_, findById, findByName } from "@Src/utils";
import { CharacterInfoContext, CharacterInfoState } from "./character-info-context";
import { RootState } from "@Store/store";
import { useSelector } from "@Store/hooks";

interface CharacterInfoProviderProps {
  char: Character;
  weapon: UserWeapon;
  artifacts: UserArtifacts;
  children: React.ReactNode;
}
function CharacterInfoProviderCore({ char, weapon, artifacts, children }: CharacterInfoProviderProps) {
  const { isLoading, error, appChar } = useAppCharacter(char.name);
  const appWeapon = $AppData.getWeapon(weapon.code);

  const characterInfoState = useMemo<CharacterInfoState>(() => {
    if (appChar && appWeapon) {
      const { totalAttr, artAttr } = getCalculationStats({
        char,
        appChar,
        appWeapon,
        weapon,
        artifacts,
      });

      return {
        loading: false,
        data: {
          char,
          appChar,
          weapon,
          appWeapon,
          artifacts,
          setBonuses: Calculation_.getArtifactSetBonuses(artifacts),
          totalAttr,
          artAttr,
        },
      };
    }

    // #to-do add error

    return {
      loading: true,
      data: null,
    };
  }, [char, appChar, weapon, appWeapon, artifacts]);

  return <CharacterInfoContext.Provider value={characterInfoState}>{children}</CharacterInfoContext.Provider>;
}

const parseUserdb = (state: RootState) => {
  const { userChars, userWps, userArts, chosenChar } = state.userdb;
  const chosenCharInfo = findByName(userChars, chosenChar);
  const weapon = findById(userWps, chosenCharInfo?.weaponID);
  const charCount = userChars.length;

  if (chosenCharInfo && weapon) {
    const { weaponID, artifactIDs, ...char } = chosenCharInfo;

    return {
      characterInfo: {
        char,
        weapon,
        artifacts: artifactIDs.map((id) => (id ? findById(userArts, id) ?? null : null)),
      },
      charCount,
    };
  }
  return {
    characterInfo: null,
    charCount,
  };
};

export function CharacterInfoProvider(props: Pick<CharacterInfoProviderProps, "children">) {
  const { charCount, characterInfo } = useSelector(parseUserdb);

  if (charCount) {
    return characterInfo ? (
      <CharacterInfoProviderCore {...characterInfo}>{props.children}</CharacterInfoProviderCore>
    ) : null;
  }

  return (
    <div className="pt-8">
      <p className="text-center text-lg text-hint-color">No characters found</p>
    </div>
  );
}
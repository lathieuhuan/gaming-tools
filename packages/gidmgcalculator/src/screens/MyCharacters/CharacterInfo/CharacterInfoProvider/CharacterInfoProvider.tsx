import { useMemo } from "react";
import { GeneralCalc, getCalculationStats } from "@Backend";

import type { Character, UserArtifacts, UserWeapon } from "@Src/types";
import type { RootState } from "@Store/store";

import { useAppCharacter } from "@Src/hooks";
import { $AppData, $AppWeapon } from "@Src/services";
import { findById, findByName } from "@Src/utils";
import { useSelector } from "@Store/hooks";
import { CharacterInfoContext, type CharacterInfoState } from "./character-info-context";

interface CharacterInfoProviderProps {
  char: Character;
  weapon: UserWeapon;
  artifacts: UserArtifacts;
  children: React.ReactNode;
}
function CharacterInfoProviderCore({ char, weapon, artifacts, children }: CharacterInfoProviderProps) {
  const { isLoading, data: appChar } = useAppCharacter(char.name);
  const appWeapon = $AppWeapon.get(weapon.code);

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
          setBonuses: GeneralCalc.getArtifactSetBonuses(artifacts),
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

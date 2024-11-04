import { useMemo } from "react";
import { GeneralCalc, getCalculationStats } from "@Backend";

import type { Character, UserArtifacts, UserWeapon } from "@Src/types";
import type { RootState } from "@Store/store";

import { useAppCharacter } from "@Src/hooks";
import { $AppWeapon } from "@Src/services";
import { findById, findByName } from "@Src/utils";
import { useSelector } from "@Store/hooks";
import { MyCharacterDetailInfoContext, type MyCharacterDetailInfoState } from "./my-character-detail-info-context";

interface MyCharacterDetailInfoProviderProps {
  char: Character;
  weapon: UserWeapon;
  artifacts: UserArtifacts;
  children: React.ReactNode;
}
function MyCharacterDetailInfoProviderCore({ char, weapon, artifacts, children }: MyCharacterDetailInfoProviderProps) {
  const { isLoading, data: appChar } = useAppCharacter(char.name);
  const appWeapon = $AppWeapon.get(weapon.code);

  const characterInfoState = useMemo<MyCharacterDetailInfoState>(() => {
    if (appChar && appWeapon) {
      const { totalAttr, artAttr } = getCalculationStats(
        {
          char,
          weapon,
          artifacts,
        },
        {
          appChar,
          appWeapon,
        }
      );

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

    // #TODO add error

    return {
      loading: true,
      data: null,
    };
  }, [char, appChar, weapon, appWeapon, artifacts]);

  return (
    <MyCharacterDetailInfoContext.Provider value={characterInfoState}>{children}</MyCharacterDetailInfoContext.Provider>
  );
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

export function MyCharacterDetailInfoProvider(props: Pick<MyCharacterDetailInfoProviderProps, "children">) {
  const { charCount, characterInfo } = useSelector(parseUserdb);

  if (charCount) {
    return characterInfo ? (
      <MyCharacterDetailInfoProviderCore {...characterInfo}>{props.children}</MyCharacterDetailInfoProviderCore>
    ) : null;
  }

  return (
    <div className="pt-8">
      <p className="text-center text-lg text-hint-color">No characters found</p>
    </div>
  );
}

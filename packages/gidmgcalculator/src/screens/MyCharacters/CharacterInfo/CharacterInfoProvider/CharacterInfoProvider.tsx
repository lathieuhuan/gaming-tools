import { useMemo } from "react";
import type { Character, UserArtifacts, UserWeapon } from "@Src/types";

import { useAppCharacter } from "@Src/hooks";
import { getCalculationStats } from "@Src/calculation";
import { $AppData } from "@Src/services";
import { Calculation_, findById, findByName } from "@Src/utils";
import { CharacterInfoContext, CharacterInfoState } from "./character-info-context";
import { RootState } from "@Store/store";
import { useSelector } from "@Store/hooks";

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

export function CharacterInfoProvider(props: Pick<CharacterInfoProviderProps, "children">) {
  const chosenCharacterInfo = useSelector(selectChosenCharacterInfo);

  return chosenCharacterInfo ? (
    <CharacterInfoProviderCore {...chosenCharacterInfo}>{props.children}</CharacterInfoProviderCore>
  ) : null;
}

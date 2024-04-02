import { useMemo } from "react";
import type { Character, UserArtifacts, UserWeapon } from "@Src/types";

import { useAppCharacter } from "@Src/hooks";
import { getCalculationStats } from "@Src/calculation";
import { $AppData } from "@Src/services";
import { Calculation_ } from "@Src/utils";
import { CharacterInfoContext, CharacterInfoState } from "./character-info-context";

interface CharacterInfoProviderProps {
  char: Character;
  weapon: UserWeapon;
  artifacts: UserArtifacts;
  children: React.ReactNode;
}
export function CharacterInfoProvider({ char, weapon, artifacts, children }: CharacterInfoProviderProps) {
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

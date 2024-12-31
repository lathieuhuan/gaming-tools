import { useMemo } from "react";
import { GeneralCalc, getDataOfSetupEntities, InputProcessor } from "@Backend";

import type { Character, UserArtifacts, UserWeapon } from "@Src/types";
import type { RootState } from "@Store/store";

// import { useAppCharacter } from "@Src/hooks";
import Array_ from "@Src/utils/array-utils";
import { useSelector } from "@Store/hooks";
import { MyCharacterDetailInfoContext, type MyCharacterDetailInfoState } from "./my-character-detail-info-context";
import { makeUICharacterRecord } from "@Src/utils/ui-character-record";

interface MyCharacterDetailInfoProviderProps {
  setup: {
    char: Character;
    weapon: UserWeapon;
    artifacts: UserArtifacts;
  };
  children: React.ReactNode;
}
function MyCharacterDetailInfoProviderCore({ setup, children }: MyCharacterDetailInfoProviderProps) {
  // const { isLoading, data: appChar } = useAppCharacter(char.name);

  const characterInfoState = useMemo<MyCharacterDetailInfoState>(() => {
    const data = getDataOfSetupEntities(setup);
    const stats = new InputProcessor(setup, data).getCalculationStats();
    const characterRecord = makeUICharacterRecord(setup.char, []);

    return {
      loading: false,
      data: {
        character: setup.char,
        weapon: setup.weapon,
        artifacts: setup.artifacts,
        characterRecord,
        appWeapon: data.appWeapons[setup.weapon.code],
        setBonuses: GeneralCalc.getArtifactSetBonuses(setup.artifacts),
        totalAttr: stats.totalAttr,
        artAttr: stats.artAttr,
      },
    };
  }, [setup]);

  return (
    <MyCharacterDetailInfoContext.Provider value={characterInfoState}>{children}</MyCharacterDetailInfoContext.Provider>
  );
}

const parseUserdb = (state: RootState) => {
  const { userChars, userWps, userArts, chosenChar } = state.userdb;
  const chosenCharInfo = Array_.findByName(userChars, chosenChar);
  const weapon = Array_.findById(userWps, chosenCharInfo?.weaponID);
  const charCount = userChars.length;

  if (chosenCharInfo && weapon) {
    const { weaponID, artifactIDs, ...char } = chosenCharInfo;

    return {
      setup: {
        char,
        weapon,
        artifacts: artifactIDs.map((id) => (id ? Array_.findById(userArts, id) ?? null : null)),
      },
      charCount,
    };
  }
  return {
    setup: null,
    charCount,
  };
};

export function MyCharacterDetailInfoProvider(props: Pick<MyCharacterDetailInfoProviderProps, "children">) {
  const { charCount, setup } = useSelector(parseUserdb);

  if (charCount) {
    return setup ? (
      <MyCharacterDetailInfoProviderCore setup={setup}>{props.children}</MyCharacterDetailInfoProviderCore>
    ) : null;
  }

  return (
    <div className="pt-8">
      <p className="text-center text-lg text-hint-color">No characters found</p>
    </div>
  );
}

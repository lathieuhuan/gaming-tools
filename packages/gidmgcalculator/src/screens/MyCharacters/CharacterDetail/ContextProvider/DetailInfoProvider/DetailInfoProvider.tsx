import { useMemo } from "react";
import { GeneralCalc, InputProcessor } from "@Calculation";

import type { Character, UserArtifacts, UserWeapon } from "@Src/types";
import type { RootState } from "@Store/store";

// import { useAppCharacter } from "@Src/hooks";
import Array_ from "@Src/utils/array-utils";
import { getSetupEntitiesData } from "@Src/utils/getSetupEntitiesData";
import { useSelector } from "@Store/hooks";
import { DetailInfoContext, type DetailInfo } from "./DetailInfo.context";

interface DetailInfoProviderProps {
  setup: {
    char: Character;
    weapon: UserWeapon;
    artifacts: UserArtifacts;
  };
  children: React.ReactNode;
}
function DetailInfoProviderCore({ setup, children }: DetailInfoProviderProps) {
  // const { isLoading, data: appChar } = useAppCharacter(char.name);

  const detailInfo = useMemo<DetailInfo>(() => {
    const data = getSetupEntitiesData(setup);
    const processor = new InputProcessor(setup, data);
    const stats = processor.getCalculationStats();

    return {
      character: setup.char,
      weapon: setup.weapon,
      artifacts: setup.artifacts,
      characterData: processor.characterData,
      appWeapon: data.appWeapons[setup.weapon.code],
      setBonuses: GeneralCalc.getArtifactSetBonuses(setup.artifacts),
      totalAttr: stats.totalAttr,
      artAttr: stats.artAttr,
    };
  }, [setup]);

  return <DetailInfoContext.Provider value={detailInfo}>{children}</DetailInfoContext.Provider>;
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

export function DetailInfoProvider(props: Pick<DetailInfoProviderProps, "children">) {
  const { charCount, setup } = useSelector(parseUserdb);

  if (charCount) {
    return setup ? <DetailInfoProviderCore setup={setup}>{props.children}</DetailInfoProviderCore> : null;
  }

  return (
    <div className="pt-8">
      <p className="text-center text-lg text-hint-color">No characters found</p>
    </div>
  );
}

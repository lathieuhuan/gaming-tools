import { useEffect, useState } from "react";
import type { UserArtifacts, UserWeapon } from "@Src/types";
import { Setup_, findById } from "@Src/utils";
import { useSelector } from "@Store/hooks";
import { selectUserArtifacts, selectUserSetups, selectUserWeapons } from "@Store/userdb-slice";

type SetupItemInfos = Record<
  string,
  {
    weapon: UserWeapon | null;
    artifacts: UserArtifacts;
  }
>;

export function useSetupItems(userSetups: ReturnType<typeof selectUserSetups>) {
  const userWps = useSelector(selectUserWeapons);
  const userArts = useSelector(selectUserArtifacts);

  const [record, setRecord] = useState<SetupItemInfos>({});

  const getSetupItems = () => {
    const result: SetupItemInfos = {};

    for (const setup of userSetups) {
      if (Setup_.isUserSetup(setup)) {
        result[setup.ID] = {
          weapon: findById(userWps, setup.weaponID) || null,
          artifacts: setup.artifactIDs.map((ID) => findById(userArts, ID) || null),
        };
      }
    }

    return result;
  };

  useEffect(() => setRecord(getSetupItems()), [userSetups]);

  return {
    itemsBySetupID: record,
  };
}

import { useMemo } from "react";
import { Setup_, type UserSetupItems } from "@Src/utils";
import { useSelector } from "@Store/hooks";
import { selectUserArtifacts, selectUserSetups, selectUserWeapons } from "@Store/userdb-slice";

type SetupItemInfos = Record<string, UserSetupItems>;

export function useSetupItems(userSetups: ReturnType<typeof selectUserSetups>) {
  const userWeapons = useSelector(selectUserWeapons);
  const userArtifacts = useSelector(selectUserArtifacts);

  const record = useMemo(() => {
    const result: SetupItemInfos = {};

    for (const setup of userSetups) {
      if (Setup_.isUserSetup(setup)) {
        result[setup.ID] = Setup_.getUserSetupItems(setup, userWeapons, userArtifacts);
      }
    }
    return result;
    //
  }, [userSetups]);

  return {
    itemsBySetupID: record,
  };
}

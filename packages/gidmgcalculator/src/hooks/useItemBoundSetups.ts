import { useEffect, useMemo } from "react";

import type { IDbItem, IDbSetup } from "@/types";
import { isDbSetup } from "@/utils/setup";
import Array_ from "@/utils/Array";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUserArtifact, updateUserWeapon, selectUserSetups } from "@Store/userdb-slice";

export type BoundingItem = Pick<IDbItem, "ID" | "setupIDs">;

export function useItemBoundSetups(item?: BoundingItem, isWeapon?: boolean): IDbSetup[] {
  const dispatch = useDispatch();
  const userSetups = useSelector(selectUserSetups);

  const result = useMemo(() => {
    if (!item) {
      return {
        validSetups: [],
        validSetupIDs: [],
        invalidSetupIDs: [],
      };
    }

    const validSetups: IDbSetup[] = [];
    const validSetupIDs: number[] = [];
    const invalidSetupIDs: number[] = [];

    if (item.setupIDs?.length) {
      for (const id of item.setupIDs) {
        const containerSetup = Array_.findById(userSetups, id);

        if (containerSetup && isDbSetup(containerSetup)) {
          const isValid = isWeapon
            ? containerSetup.main.weaponID === item.ID
            : containerSetup.main.artifactIDs.includes(item.ID);

          if (isValid) {
            validSetups.push(containerSetup);
            validSetupIDs.push(containerSetup.ID);
            continue;
          }
        }
        invalidSetupIDs.push(id);
      }
    }

    return {
      isWeapon,
      validSetups,
      validSetupIDs,
      invalidSetupIDs,
    };
  }, [item?.ID]);

  useEffect(() => {
    if (item && result.invalidSetupIDs.length) {
      const changes = {
        ID: item.ID,
        setupIDs: result.validSetupIDs,
      };
      result.isWeapon ? dispatch(updateUserWeapon(changes)) : dispatch(updateUserArtifact(changes));
    }
  }, [result]);

  return result.validSetups;
}

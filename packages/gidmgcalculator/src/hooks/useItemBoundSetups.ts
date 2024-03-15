import { useEffect, useMemo } from "react";

import type { UserItem, UserSetup } from "@Src/types";
import { findById } from "@Src/utils";
import setupUtils from "@Utils/setup-utils";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUserArtifact, updateUserWeapon, selectUserSetups } from "@Store/userdbSlice";

export type BoundingItem = Pick<UserItem, "ID" | "setupIDs">;

export const useItemBoundSetups = (item?: BoundingItem, isWeapon?: boolean): UserSetup[] => {
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

    const validSetups: UserSetup[] = [];
    const validSetupIDs: number[] = [];
    const invalidSetupIDs: number[] = [];

    if (item.setupIDs?.length) {
      for (const id of item.setupIDs) {
        const containerSetup = findById(userSetups, id);

        if (containerSetup && setupUtils.isUserSetup(containerSetup)) {
          const isValid = isWeapon ? containerSetup.weaponID === item.ID : containerSetup.artifactIDs.includes(item.ID);

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
};

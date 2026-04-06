import { useEffect, useMemo } from "react";
import { Array_ } from "ron-utils";

import { isDbSetup } from "@/logic/setup.logic";
import type { IDbSetup, RawItem } from "@/types";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { selectDbSetups, updateDbArtifact, updateDbWeapon } from "@Store/userdbSlice";

export type BoundingItem = Pick<RawItem, "ID" | "setupIDs">;

export function useItemBoundSetups(item?: BoundingItem, isWeapon?: boolean): IDbSetup[] {
  const dispatch = useDispatch();
  const userSetups = useSelector(selectDbSetups);

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
      result.isWeapon ? dispatch(updateDbWeapon(changes)) : dispatch(updateDbArtifact(changes));
    }
  }, [result]);

  return result.validSetups;
}

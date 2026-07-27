import { useMemo } from "react";
import { Array_ } from "ron-utils";

import { isWeapon } from "@/logic/entity.logic";
import { isDbSetup } from "@/logic/setup.logic";
import type { DbSetup, RawItem } from "@/types";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { selectDbSetups, updateDbArtifact, updateDbWeapon } from "@Store/userdbSlice";

export function useItemBoundSetups(item?: RawItem): DbSetup[] {
  const dispatch = useDispatch();
  const userSetups = useSelector(selectDbSetups);

  const setups = useMemo<DbSetup[]>(() => {
    if (!item || !item.setupIDs?.length) {
      return [];
    }

    const itemIsWeapon = isWeapon(item);

    const validRelatedSetups = item.setupIDs.reduce<DbSetup[]>((acc, id) => {
      const userSetup = Array_.findById(userSetups, id);

      if (!userSetup || !isDbSetup(userSetup)) {
        return acc;
      }

      const isValidSetup = itemIsWeapon
        ? userSetup.main.weaponID === item.ID
        : userSetup.main.artifactIDs.includes(item.ID);

      if (isValidSetup) {
        acc.push(userSetup);
      }

      return acc;
    }, []);

    if (validRelatedSetups.length !== item.setupIDs.length) {
      const changes = {
        ID: item.ID,
        setupIDs: validRelatedSetups.map((setup) => setup.ID),
      };

      if (itemIsWeapon) {
        dispatch(updateDbWeapon(changes));
      } else {
        dispatch(updateDbArtifact(changes));
      }
    }

    return validRelatedSetups;
  }, [item?.ID]);

  return setups;
}

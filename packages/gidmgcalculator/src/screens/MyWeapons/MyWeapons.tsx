import { createSelector } from "@reduxjs/toolkit";
import { useEffect, useMemo, useRef, useState } from "react";
import { Array_ } from "ron-utils";
import { useScreenWatcher, useValues, WarehouseLayout } from "rond";

import type { RawWeapon, WeaponType } from "@/types";

import { createWeapon } from "@/logic/entity.logic";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectDbWeapons, sortDbWeapons } from "@Store/userdbSlice";

// Component
import { InventoryRack, WeaponTypeSelect } from "@/components";
import { CompoundFilterButton } from "../components/CompoundFilterButton";
import { UserItemSortButton } from "../components/UserItemSortButton";
import { WarehouseWrapper } from "../components/WarehouseWrapper";
import { ActionContainer } from "./ActionContainer";
import { ActiveWeaponView, ActiveWeaponViewControlRef } from "./ActiveWeaponView";
import { AddButton } from "./AddButton";

const selectWeaponInventory = createSelector(
  selectDbWeapons,
  (_: unknown, types: WeaponType[]) => types,
  (userWps, types) => ({
    filteredWeapons: types.length ? userWps.filter((wp) => types.includes(wp.type)) : userWps,
    totalCount: userWps.length,
  })
);

function MyWeapons() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const activeWeaponViewRef = useRef<ActiveWeaponViewControlRef>(null);

  const [activeId, setActiveId] = useState<number>();

  const {
    values: weaponTypes,
    toggle: toggleWeaponType,
    update: updateWeaponTypes,
  } = useValues<WeaponType>({
    multiple: true,
  });
  const { filteredWeapons, totalCount } = useSelector((state) =>
    selectWeaponInventory(state, weaponTypes)
  );

  const activeWeapon = useMemo(() => {
    const data = Array_.findById(filteredWeapons, activeId);
    return data && createWeapon(data);
  }, [filteredWeapons, activeId]);

  const handleRemoveWeapon = (weapon: RawWeapon) => {
    const removedIndex = Array_.indexById(filteredWeapons, weapon.ID);

    if (removedIndex !== -1) {
      let newActiveId: number | undefined = undefined;

      if (filteredWeapons.length > 1) {
        const move = removedIndex === filteredWeapons.length - 1 ? -1 : 1;

        newActiveId = filteredWeapons[removedIndex + move]?.ID;
      }

      setActiveId(newActiveId);
    }
  };

  useEffect(() => {
    if (activeWeapon) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Delete") {
          activeWeaponViewRef.current?.remove();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [activeWeapon]);

  const actions = (
    <ActionContainer extra={<WeaponTypeSelect values={weaponTypes} onSelect={toggleWeaponType} />}>
      {({ toggleExtra }) => (
        <>
          <AddButton currentWeaponsCount={totalCount} />

          <UserItemSortButton onSelectSort={(sort) => dispatch(sortDbWeapons(sort))} />

          {screenWatcher.isFromSize("sm") ? (
            <WeaponTypeSelect values={weaponTypes} onSelect={toggleWeaponType} />
          ) : (
            <CompoundFilterButton
              active={weaponTypes.length > 0}
              onClick={toggleExtra}
              onClear={() => updateWeaponTypes([])}
            />
          )}
        </>
      )}
    </ActionContainer>
  );

  return (
    <WarehouseLayout className="h-full" actions={actions}>
      <InventoryRack
        data={filteredWeapons}
        emptyText="No weapons found"
        itemCls="max-w-1/3 basis-1/3 xm:max-w-1/4 xm:basis-1/4 lg:max-w-1/6 lg:basis-1/6 xl:max-w-1/8 xl:basis-1/8"
        pageSize={screenWatcher.isFromSize("xl") ? 80 : 60}
        activeId={activeWeapon?.ID}
        onChangeItem={(weapon) => setActiveId(weapon?.userData.ID)}
      />
      <ActiveWeaponView
        ref={activeWeaponViewRef}
        weapon={activeWeapon}
        onRemoveWeapon={handleRemoveWeapon}
      />
    </WarehouseLayout>
  );
}

export function MyWeaponsWrapper() {
  return (
    <WarehouseWrapper>
      <MyWeapons />
    </WarehouseWrapper>
  );
}

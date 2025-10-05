import { WeaponType } from "@Calculation";
import { createSelector } from "@reduxjs/toolkit";
import { useMemo, useState } from "react";
import {
  Button,
  ButtonGroup,
  CollapseSpace,
  ConfirmModal,
  LoadingPlate,
  message,
  useScreenWatcher,
  WarehouseLayout,
} from "rond";

import type { UserWeapon } from "@/types";

import { MAX_USER_WEAPONS } from "@/constants";
import { useTravelerKey, useWeaponTypeSelect } from "@/hooks";
import { $AppWeapon } from "@/services";
import Array_ from "@/utils/array-utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";
import {
  addUserWeapon,
  removeWeapon,
  selectUserWeapons,
  sortWeapons,
  swapWeaponOwner,
  updateUserWeapon,
} from "@Store/userdb-slice";

// Component
import { InventoryRack, Tavern, WeaponCard, WeaponForge } from "@/components";

type ModalType = "ADD_WEAPON" | "SELECT_WEAPON_OWNER" | "REMOVE_WEAPON" | "";

const selectWeaponInventory = createSelector(
  selectUserWeapons,
  (_: unknown, types: WeaponType[]) => types,
  (userWps, types) => ({
    filteredWeapons: types.length ? userWps.filter((wp) => types.includes(wp.type)) : userWps,
    totalCount: userWps.length,
  })
);

function MyWeapons() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();

  const [chosenId, setChosenId] = useState<number>();
  const [modalType, setModalType] = useState<ModalType>("");
  const [filterIsActive, setFilterIsActive] = useState(false);

  const { weaponTypes, weaponTypeSelectProps, WeaponTypeSelect } = useWeaponTypeSelect(null, {
    multiple: true,
  });
  const { filteredWeapons, totalCount } = useSelector((state) => selectWeaponInventory(state, weaponTypes));
  const chosenWeapon = useMemo(() => Array_.findById(filteredWeapons, chosenId), [filteredWeapons, chosenId]);

  const checkIfMaxWeaponsReached = () => {
    if (totalCount >= MAX_USER_WEAPONS) {
      message.error("Number of stored weapons has reached its limit.");
      return true;
    }
  };

  const closeModal = () => setModalType("");

  const onClickAddWeapon = () => {
    if (!checkIfMaxWeaponsReached()) {
      setModalType("ADD_WEAPON");
    }
  };

  const onClickRemoveWeapon = (weapon: UserWeapon) => {
    if (weapon.setupIDs?.length) {
      return message.info("This weapon cannot be deleted. It is used by some Setups.");
    }
    setModalType("REMOVE_WEAPON");
  };

  const onConfirmRemoveWeapon = (weapon: UserWeapon) => {
    dispatch(removeWeapon(weapon));

    const removedIndex = Array_.indexById(filteredWeapons, weapon.ID);

    if (removedIndex !== -1) {
      if (filteredWeapons.length > 1) {
        const move = removedIndex === filteredWeapons.length - 1 ? -1 : 1;

        setChosenId(filteredWeapons[removedIndex + move]?.ID);
      } else {
        setChosenId(undefined);
      }
    }
  };

  const actions = (
    <div className="flex items-center">
      <ButtonGroup
        className="mr-4"
        buttons={[
          { children: "Add", onClick: onClickAddWeapon },
          {
            children: "Sort",
            onClick: () => dispatch(sortWeapons()),
          },
        ]}
      />

      {screenWatcher.isFromSize("sm") ? (
        <WeaponTypeSelect {...weaponTypeSelectProps} />
      ) : (
        <>
          <Button variant={filterIsActive ? "active" : "default"} onClick={() => setFilterIsActive(!filterIsActive)}>
            Filter
          </Button>

          <CollapseSpace className="w-full absolute top-full left-0 z-20" active={filterIsActive}>
            <div className="px-4 py-6 shadow-common bg-dark-2">
              {<WeaponTypeSelect {...weaponTypeSelectProps} />}
            </div>
          </CollapseSpace>
        </>
      )}
    </div>
  );

  return (
    <WarehouseLayout className="h-full" actions={actions}>
      <InventoryRack
        data={filteredWeapons}
        emptyText="No weapons found"
        itemCls="max-w-1/3 basis-1/3 xm:max-w-1/4 xm:basis-1/4 lg:max-w-1/6 lg:basis-1/6 xl:max-w-1/8 xl:basis-1/8"
        pageSize={screenWatcher.isFromSize("xl") ? 80 : 60}
        chosenID={chosenWeapon?.ID}
        onChangeItem={(weapon) => setChosenId(weapon?.ID)}
      />

      <WeaponCard
        wrapperCls="w-76 shrink-0"
        mutable
        weapon={chosenWeapon}
        withOwnerLabel
        upgrade={(level, weapon) => dispatch(updateUserWeapon({ ID: weapon.ID, level }))}
        refine={(refi, weapon) => dispatch(updateUserWeapon({ ID: weapon.ID, refi }))}
        actions={[
          {
            children: "Remove",
            onClick: (_, weapon) => onClickRemoveWeapon(weapon),
          },
          {
            children: "Equip",
            onClick: () => setModalType("SELECT_WEAPON_OWNER"),
          },
        ]}
      />

      <WeaponForge
        active={modalType === "ADD_WEAPON"}
        hasMultipleMode
        hasConfigStep
        onForgeWeapon={(weapon) => {
          if (checkIfMaxWeaponsReached()) return;

          const newUserWeapon: UserWeapon = {
            ...weapon,
            ID: Date.now(),
            owner: null,
          };
          dispatch(addUserWeapon(newUserWeapon));
          setChosenId(newUserWeapon.ID);
        }}
        onClose={closeModal}
      />

      {chosenWeapon && (
        <Tavern
          active={modalType === "SELECT_WEAPON_OWNER"}
          sourceType="user"
          filter={(character) => {
            return character.weaponType === chosenWeapon.type && character.name !== chosenWeapon.owner;
          }}
          onSelectCharacter={(character) => {
            dispatch(swapWeaponOwner({ weaponID: chosenWeapon.ID, newOwner: character.name }));
          }}
          onClose={closeModal}
        />
      )}

      {chosenWeapon ? (
        <ConfirmModal
          active={modalType === "REMOVE_WEAPON"}
          danger
          message={
            <>
              Remove "<b>{$AppWeapon.get(chosenWeapon.code)?.name}</b>"?{" "}
              {chosenWeapon.owner ? (
                <>
                  It is currently used by <b>{chosenWeapon.owner}</b>.
                </>
              ) : null}
            </>
          }
          focusConfirm
          onConfirm={() => onConfirmRemoveWeapon(chosenWeapon)}
          onClose={closeModal}
        />
      ) : null}
    </WarehouseLayout>
  );
}

export function MyWeaponsWrapper() {
  const appReady = useSelector(selectAppReady);
  const travelerKey = useTravelerKey();

  if (!appReady) {
    return (
      <WarehouseLayout className="h-full relative">
        <div className="absolute inset-0 flex-center">
          <LoadingPlate />
        </div>
      </WarehouseLayout>
    );
  }

  return <MyWeapons key={travelerKey} />;
}

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
  useValues,
  WarehouseLayout,
} from "rond";

import type { IWeaponBasic, WeaponType } from "@/types";

import { MAX_USER_WEAPONS } from "@/constants/config";
import { useTravelerKey, useWeaponData } from "@/hooks";
import { Weapon } from "@/models/base";
import Array_ from "@/utils/Array";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectAppReady } from "@Store/ui-slice";
import {
  addUserWeapon,
  removeWeapon,
  selectDbWeapons,
  sortWeapons,
  swapWeaponOwner,
  updateUserWeapon,
} from "@Store/userdb-slice";

// Component
import { InventoryRack, Tavern, WeaponCard, WeaponForge, WeaponTypeSelect } from "@/components";

type ModalType = "ADD_WEAPON" | "SELECT_WEAPON_OWNER" | "REMOVE_WEAPON" | "";

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
  const weaponData = useWeaponData();

  const [chosenId, setChosenId] = useState<number>();
  const [modalType, setModalType] = useState<ModalType>("");
  const [filterIsActive, setFilterIsActive] = useState(false);

  const { values: weaponTypes, toggle: toggleWeaponType } = useValues<WeaponType>({
    multiple: true,
  });
  const { filteredWeapons, totalCount } = useSelector((state) =>
    selectWeaponInventory(state, weaponTypes)
  );

  const chosenWeapon = useMemo(() => {
    const data = Array_.findById(filteredWeapons, chosenId);
    return data && new Weapon(data, weaponData.get(data.code));
  }, [filteredWeapons, chosenId]);

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

  const onClickRemoveWeapon = (weapon: IWeaponBasic) => {
    if (weapon.setupIDs?.length) {
      return message.info("This weapon cannot be deleted. It is used by some Setups.");
    }
    setModalType("REMOVE_WEAPON");
  };

  const onConfirmRemoveWeapon = (weapon: Weapon) => {
    dispatch(removeWeapon({ ID: weapon.ID }));

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
        <WeaponTypeSelect values={weaponTypes} onSelect={toggleWeaponType} />
      ) : (
        <>
          <Button
            variant={filterIsActive ? "active" : "default"}
            onClick={() => setFilterIsActive(!filterIsActive)}
          >
            Filter
          </Button>

          <CollapseSpace className="w-full absolute top-full left-0 z-20" active={filterIsActive}>
            <div className="px-4 py-6 shadow-common bg-dark-2">
              <WeaponTypeSelect values={weaponTypes} onSelect={toggleWeaponType} />
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
        onChangeItem={(weapon) => setChosenId(weapon?.userData.ID)}
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

          const newUserWeapon: IWeaponBasic = {
            ...weapon,
            ID: Date.now(),
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
          filter={({ data }) => {
            return data.weaponType === chosenWeapon.type && data.name !== chosenWeapon.owner;
          }}
          onSelectCharacter={(character) => {
            dispatch(
              swapWeaponOwner({
                weaponID: chosenWeapon.ID,
                newOwner: character.data.name,
              })
            );
          }}
          onClose={closeModal}
        />
      )}

      {chosenWeapon && (
        <ConfirmModal
          active={modalType === "REMOVE_WEAPON"}
          danger
          message={
            <>
              Remove "<b>{weaponData.get(chosenWeapon.code)?.name}</b>"?{" "}
              {chosenWeapon.owner && (
                <>
                  It is currently used by <b>{chosenWeapon.owner}</b>.
                </>
              )}
            </>
          }
          focusConfirm
          onConfirm={() => onConfirmRemoveWeapon(chosenWeapon)}
          onClose={closeModal}
        />
      )}
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

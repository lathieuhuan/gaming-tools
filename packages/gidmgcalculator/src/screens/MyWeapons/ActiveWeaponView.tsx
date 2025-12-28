import { useState } from "react";
import { ConfirmModal, message } from "rond";

import { Tavern, WeaponCard } from "@/components";
import { Weapon } from "@/models/base";
import { IWeaponBasic } from "@/types";
import { useDispatch } from "@Store/hooks";
import { removeWeapon, swapWeaponOwner, updateUserWeapon } from "@Store/userdb-slice";

type ModalType = "SELECT_WEAPON_OWNER" | "REMOVE_WEAPON" | "";

type ActiveWeaponViewProps = {
  weapon?: Weapon;
  onRemoveWeapon?: (weapon: IWeaponBasic) => void;
};

export function ActiveWeaponView({ weapon, onRemoveWeapon }: ActiveWeaponViewProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");

  const closeModal = () => setModalType("");

  const onClickRemoveWeapon = (weapon: Weapon) => {
    if (weapon.setupIDs?.length) {
      return message.info("This weapon cannot be deleted. It is used by some Setups.");
    }

    setModalType("REMOVE_WEAPON");
  };

  const onConfirmRemoveWeapon = (weapon: Weapon) => {
    dispatch(removeWeapon({ ID: weapon.ID }));
    onRemoveWeapon?.(weapon);
  };

  return (
    <>
      <WeaponCard
        wrapperCls="w-76 shrink-0"
        mutable
        weapon={weapon}
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

      {weapon && (
        <Tavern
          active={modalType === "SELECT_WEAPON_OWNER"}
          sourceType="user"
          filter={({ data }) => {
            return data.weaponType === weapon.type && data.name !== weapon.owner;
          }}
          onSelectCharacter={(character) => {
            dispatch(
              swapWeaponOwner({
                weaponID: weapon.ID,
                newOwner: character.data.name,
              })
            );
          }}
          onClose={closeModal}
        />
      )}

      {weapon && (
        <ConfirmModal
          active={modalType === "REMOVE_WEAPON"}
          danger
          message={
            <>
              Remove "<b>{weapon.data.name}</b>"?{" "}
              {weapon.owner && (
                <>
                  It is currently used by <b>{weapon.owner}</b>.
                </>
              )}
            </>
          }
          focusConfirm
          onConfirm={() => onConfirmRemoveWeapon(weapon)}
          onClose={closeModal}
        />
      )}
    </>
  );
}

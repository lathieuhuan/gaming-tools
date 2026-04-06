import { forwardRef, useImperativeHandle, useState } from "react";
import { ConfirmModal, message } from "rond";

import type { Weapon } from "@/models";
import type { RawWeapon } from "@/types";

import { Tavern, WeaponCard } from "@/components";
import { useDispatch } from "@Store/hooks";
import { removeDbWeapon, swapWeaponOwner, updateDbWeapon } from "@Store/userdbSlice";

type ModalType = "SELECT_WEAPON_OWNER" | "REMOVE_WEAPON" | "";

export type ActiveWeaponViewControlRef = {
  remove: () => void;
};

type ActiveWeaponViewProps = {
  weapon?: Weapon;
  onRemoveWeapon?: (weapon: RawWeapon) => void;
};

export const ActiveWeaponView = forwardRef<ActiveWeaponViewControlRef, ActiveWeaponViewProps>(
  ({ weapon, onRemoveWeapon }, ref) => {
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
      dispatch(removeDbWeapon({ ID: weapon.ID }));
      onRemoveWeapon?.(weapon);
    };

    useImperativeHandle(ref, () => ({
      remove: () => weapon && onClickRemoveWeapon(weapon),
    }));

    return (
      <>
        <WeaponCard
          wrapperCls="w-76 shrink-0"
          mutable
          weapon={weapon}
          withOwnerLabel
          upgrade={(level, weapon) => dispatch(updateDbWeapon({ ID: weapon.ID, level }))}
          refine={(refi, weapon) => dispatch(updateDbWeapon({ ID: weapon.ID, refi }))}
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
              return data.weaponType === weapon.type && data.code !== weapon.owner;
            }}
            onSelectCharacter={(character) => {
              dispatch(
                swapWeaponOwner({
                  weaponID: weapon.ID,
                  newOwner: character.data.code,
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
);

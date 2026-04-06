import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button, message } from "rond";

import { WeaponForge } from "@/components";
import { MAX_USER_WEAPONS } from "@/constants/config";
import { Weapon } from "@/models";
import { useDispatch } from "@Store/hooks";
import { addDbWeapon } from "@Store/userdbSlice";

type AddButtonProps = {
  currentWeaponsCount: number;
};

export function AddButton({ currentWeaponsCount }: AddButtonProps) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const isNewWeaponAddable = () => {
    if (currentWeaponsCount < MAX_USER_WEAPONS) {
      return true;
    }

    message.error("Number of stored weapons has reached its limit.");

    return false;
  };

  const handleClickAdd = () => {
    if (isNewWeaponAddable()) {
      setOpen(true);
    }
  };

  const handleForgeWeapon = (weapon: Weapon) => {
    if (isNewWeaponAddable()) {
      dispatch(addDbWeapon(weapon.serialize()));
    }
  };

  return (
    <>
      <Button icon={<FaPlus />} onClick={handleClickAdd}>
        Add
      </Button>

      <WeaponForge
        active={open}
        hasMultipleMode
        hasConfigStep
        onForgeWeapon={handleForgeWeapon}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

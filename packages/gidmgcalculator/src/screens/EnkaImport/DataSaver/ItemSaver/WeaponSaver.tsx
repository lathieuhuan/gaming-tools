import { useState } from "react";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { notification } from "rond";

import type { Weapon } from "@/models/base";
import type { IWeaponBasic } from "@/types";

import { useDispatch } from "@Store/hooks";
import { addUserWeapon, updateUserWeapon } from "@Store/userdb-slice";
import { CONTINUE_MSG, genNewEntityMessage, genSameEntityMessage } from "../_config";
import { isExactWeapon } from "../_utils";

import { SaverLayout } from "../_components/SaverLayout";
import { SavingStepLayout } from "../_components/SavingStepLayout";
import { WeaponSummary } from "../_components/WeaponSummary";

type WeaponSaverProps = {
  weapon: Weapon;
  sameWeapons: IWeaponBasic[];
  onComplete?: () => void;
};

export function WeaponSaver({ weapon, sameWeapons, onComplete }: WeaponSaverProps) {
  const dispatch = useDispatch();
  const [selectedWeapon, setSelectedWeapon] = useState<IWeaponBasic>();

  const handleSave = () => {
    const { owner, ...weaponToSave } = weapon.serialize();

    dispatch(
      addUserWeapon({
        ...weaponToSave,
        ID: Date.now(),
      })
    );

    notification.success({
      content: "Weapon saved successfully!",
    });
    onComplete?.();
  };

  const handleUpdate = () => {
    if (!selectedWeapon) {
      return;
    }

    dispatch(
      updateUserWeapon({
        ID: selectedWeapon?.ID,
        level: weapon.level,
        refi: weapon.refi,
      })
    );

    notification.success({
      content: "Weapon updated successfully!",
    });
    onComplete?.();
  };

  if (sameWeapons.length) {
    const message = genSameEntityMessage("Weapon");

    return (
      <SaverLayout type="WEAPON">
        <SavingStepLayout
          className="grow"
          actions={[
            {
              children: "Cancel",
              icon: <FaTimes />,
              onClick: onComplete,
            },
            {
              children: "Update",
              icon: <MdEdit />,
              disabled: !selectedWeapon || isExactWeapon(selectedWeapon, weapon),
              onClick: handleUpdate,
            },
          ]}
          continueProps={{
            children: "Add new",
            icon: <FaPlus />,
          }}
          onContinue={handleSave}
        >
          <WeaponSummary variant="primary" label={weapon.data.name} weapon={weapon} />

          <div className="mx-auto my-4 h-px w-1/2 bg-dark-line" />

          <p className="text-light-3 text-sm">{message.main}</p>
          <p className="mt-1 text-light-hint text-sm">{message.hint}</p>

          <div className="mt-2 space-y-2">
            {sameWeapons.map((item, index) => (
              <WeaponSummary
                key={item.ID}
                label={
                  <span>
                    <span>Weapon {index + 1}</span>{" "}
                    {item.owner && <span className="text-light-4">({item.owner})</span>}
                  </span>
                }
                weapon={item}
                selectable
                selected={selectedWeapon?.ID === item.ID}
                onSelect={() => setSelectedWeapon(item)}
              />
            ))}
          </div>
        </SavingStepLayout>
      </SaverLayout>
    );
  }

  return (
    <SaverLayout type="WEAPON">
      <SavingStepLayout
        className="grow"
        message={`${genNewEntityMessage("Weapon")} ${CONTINUE_MSG}`}
        actions={[
          {
            children: "Cancel",
            icon: <FaTimes />,
            onClick: onComplete,
          },
        ]}
        continueProps={{
          icon: <FaSave />,
          autoFocus: true,
        }}
        onContinue={handleSave}
      >
        <WeaponSummary variant="primary" label={weapon.data.name} weapon={weapon} />
      </SavingStepLayout>
    </SaverLayout>
  );
}

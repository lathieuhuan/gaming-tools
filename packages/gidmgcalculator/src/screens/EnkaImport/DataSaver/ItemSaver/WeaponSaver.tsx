import { FaPlus, FaSave } from "react-icons/fa";
import { notification } from "rond";

import type { WeaponSavingStep } from "./_types";

import { useDispatch } from "@Store/hooks";
import { addUserWeapon } from "@Store/userdb-slice";
import { genNewEntityMessage, genSimilarEntityMessage } from "../_config";

import { WeaponCard } from "@/components/WeaponCard";
import { SaverLayout } from "../_components/SaverLayout";
import { SavingStepLayout } from "../_components/SavingStepLayout";
import { WeaponSaveMenu } from "./WeaponSaveMenu";

type WeaponSaverProps = Omit<WeaponSavingStep, "type"> & {
  onComplete?: () => void;
};

export function WeaponSaver({
  data: weapon,
  saveStatus,
  similarWeapons = [],
  onComplete,
}: WeaponSaverProps) {
  const dispatch = useDispatch();

  const getWeaponBasic = () => {
    const { owner, ...weaponToSave } = weapon.serialize();
    return weaponToSave;
  };

  const handleSave = () => {
    dispatch(addUserWeapon(getWeaponBasic()));

    notification.success({
      content: "Weapon saved successfully!",
    });
    onComplete?.();
  };

  const handleAddNew = () => {
    dispatch(
      addUserWeapon({
        ...getWeaponBasic(),
        ID: Date.now(),
      })
    );

    notification.success({
      content: "Weapon added successfully!",
    });
    onComplete?.();
  };

  switch (saveStatus) {
    case "NEW":
      return (
        <SaverLayout type="WEAPON">
          <SavingStepLayout
            className="grow"
            message={genNewEntityMessage("Weapon")}
            actions={[
              {
                children: "Add",
                autoFocus: true,
                icon: <FaSave />,
                onClick: handleSave,
              },
            ]}
            onContinue={onComplete}
          >
            <WeaponCard wrapperCls="max-h-full custom-scrollbar" weapon={weapon} />
          </SavingStepLayout>
        </SaverLayout>
      );

    case "POSSIBLE_DUP":
      return (
        <SaverLayout type="WEAPON">
          <SavingStepLayout
            className="grow"
            message={genSimilarEntityMessage("Weapon")}
            actions={[
              {
                children: "Add new",
                icon: <FaPlus />,
                onClick: handleAddNew,
              },
            ]}
            onContinue={onComplete}
          >
            <WeaponSaveMenu items={similarWeapons} weapon={weapon} onUpdate={onComplete} />
          </SavingStepLayout>
        </SaverLayout>
      );
  }
}

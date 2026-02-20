import { useState } from "react";
import { FaSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { notification, OverflowWatcher } from "rond";

import type { Weapon } from "@/models";
import type { IWeaponBasic } from "@/types";

import { useStoreCheck } from "@/hooks/useStoreCheck";
import { useDispatch } from "@Store/hooks";
import { addDbWeapon, updateDbWeapon } from "@Store/userdbSlice";
import { genCaseConfigs } from "../_config";
import { isExactWeapon } from "../_logic";

import { CaseNewWeapon } from "../_components/CaseNewWeapon";
import { CaseSameWeapons } from "../_components/CaseSameWeapons";
import { SaverLayout } from "../_components/SaverLayout";
import { SavingStepLayout } from "../_components/SavingStepLayout";

type WeaponSaverProps = {
  weapon: Weapon;
  sameWeapons: IWeaponBasic[];
  onComplete?: () => void;
};

export function WeaponSaver({ weapon, sameWeapons, onComplete }: WeaponSaverProps) {
  const dispatch = useDispatch();
  const { isAbleToAddWeapon } = useStoreCheck();
  const [selectedWeapon, setSelectedWeapon] = useState<IWeaponBasic>();

  const handleSave = () => {
    const error = isAbleToAddWeapon(1);

    if (error) {
      notification.error({ content: error.message });
      return;
    }

    const { owner, ...weaponToSave } = weapon.serialize();

    dispatch(
      addDbWeapon({
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
      updateDbWeapon({
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

  const selectedIsSame = selectedWeapon && isExactWeapon(selectedWeapon, weapon);
  const hasNoSameWeapons = !sameWeapons.length;

  const caseConfigs = genCaseConfigs("Weapon", {
    hasNoSameEntities: hasNoSameWeapons,
    withoutOwner: false,
  });

  return (
    <SaverLayout type="WEAPON">
      <SavingStepLayout
        className="grow"
        actions={[
          {
            children: "Cancel",
            className: "mr-auto",
            onClick: onComplete,
          },
          {
            children: "Update",
            icon: <MdEdit />,
            hidden: hasNoSameWeapons,
            disabled: !selectedWeapon || selectedIsSame,
            onClick: handleUpdate,
          },
          {
            children: "Add new",
            icon: <FaSave />,
            autoFocus: hasNoSameWeapons,
            onClick: handleSave,
          },
        ]}
      >
        <div className="h-full flex flex-col justify-between">
          <OverflowWatcher className="grow custom-scrollbar" overflowedCls="pr-2">
            <CaseNewWeapon {...caseConfigs.toSaveCase} weapon={weapon} />

            {sameWeapons.length > 0 && (
              <CaseSameWeapons
                {...caseConfigs.sameCase}
                withDivider
                sameWeapons={sameWeapons}
                selectedWeapon={selectedWeapon}
                onSelectWeapon={setSelectedWeapon}
              />
            )}
          </OverflowWatcher>

          {selectedIsSame && (
            <div className="mt-4 text-sm">
              The selected weapon is already the same as the weapon to save.
            </div>
          )}
        </div>
      </SavingStepLayout>
    </SaverLayout>
  );
}

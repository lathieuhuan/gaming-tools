import { RefCallback, useState } from "react";
import { FaAngleDoubleRight, FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { ButtonProps, Checkbox, notification } from "rond";

import type { Weapon } from "@/models";
import type { RawWeapon } from "@/types";
import type { SaveOutput, WeaponSavingStep } from "./types";

import { useStoreCheck } from "@/hooks/useStoreCheck";
import { genCaseConfigs } from "../config";
import { isExactWeapon, isSameWeapon } from "../logic";

import { EquipmentIcon } from "@/assets/icons";
import { CaseNewWeapon } from "../components/CaseNewWeapon";
import { CaseSameWeapons } from "../components/CaseSameWeapons";
import { SavingCase } from "../components/SavingCase";
import { SavingStepLayout } from "../components/SavingStepLayout";
import { WeaponSummary } from "../components/WeaponSummary";

export type SaveWeaponStepProps = {
  className?: string;
  step: WeaponSavingStep;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onAction: (output: NonNullable<SaveOutput["weapon"]>) => void;
};

export function SaveWeaponStep({ className, step, ctaRef, onAction }: SaveWeaponStepProps) {
  const { data: weapon, currentWeapon, sameWeapons } = step;
  const { isAbleToAddWeapon } = useStoreCheck();
  const [selectedWeapon, setSelectedWeapon] = useState<RawWeapon>();
  const [shouldUpdate, setShouldUpdate] = useState(true);

  const handleSelectWeapon = (weapon: RawWeapon) => {
    setSelectedWeapon(weapon);
    setShouldUpdate(true);
  };

  const handleCreate = () => {
    const error = isAbleToAddWeapon(1);

    if (error) {
      notification.error({ content: error.message });
      return;
    }

    onAction?.({
      action: "CREATE",
      weapon: weapon.serialize(),
    });
  };

  const handleUpdate = () => {
    if (selectedWeapon) {
      onAction?.({
        action: "UPDATE",
        weapon: {
          ...(shouldUpdate ? weapon.serialize() : selectedWeapon),
          ID: selectedWeapon.ID,
        },
      });
    }
  };

  const handleSkip = () => {
    if (currentWeapon) {
      onAction?.({
        action: "NONE",
        weapon: currentWeapon.serialize(),
      });
    }
  };

  let actions: ButtonProps[] = [];
  let showUpdateCheckbox = selectedWeapon && !isExactWeapon(selectedWeapon, weapon);

  if (currentWeapon || sameWeapons.length) {
    const currentIsSelected = currentWeapon && currentWeapon.ID === selectedWeapon?.ID;

    actions.push(
      currentIsSelected
        ? {
            children: "Update",
            icon: <MdEdit />,
            hidden: !selectedWeapon,
            onClick: handleUpdate,
          }
        : {
            children: "Equip",
            icon: <EquipmentIcon className="text-xl" />,
            hidden: !selectedWeapon,
            onClick: handleUpdate,
          }
    );

    // We already Update button, do not need checkbox for this case
    showUpdateCheckbox = showUpdateCheckbox && !currentIsSelected;
  }

  const hasNoSameWeapons =
    (!currentWeapon || !isSameWeapon(currentWeapon, weapon)) && !sameWeapons.length;

  const caseConfigs = genCaseConfigs("Weapon", {
    hasNoSameEntities: hasNoSameWeapons,
    withoutOwner: true,
  });

  return (
    <SavingStepLayout
      className={className}
      actions={actions.concat(
        {
          children: "Add new",
          icon: <FaPlus />,
          refProp: hasNoSameWeapons ? ctaRef : undefined,
          onClick: handleCreate,
        },
        {
          children: "Skip",
          icon: <FaAngleDoubleRight />,
          hidden: !currentWeapon,
          onClick: handleSkip,
        }
      )}
    >
      <div className="h-full flex flex-col">
        <div className="grow custom-scrollbar">
          <CaseNewWeapon {...caseConfigs.toSaveCase} weapon={weapon} />

          {currentWeapon && (
            <CaseCurrentWeapon
              currentWeapon={currentWeapon}
              isOldVersion={
                isSameWeapon(currentWeapon, weapon) && !isExactWeapon(currentWeapon, weapon)
              }
              selected={selectedWeapon?.ID === currentWeapon.ID}
              onSelect={() => handleSelectWeapon(currentWeapon)}
            />
          )}

          {sameWeapons.length > 0 && (
            <CaseSameWeapons
              {...caseConfigs.sameCase}
              withDivider
              sameWeapons={sameWeapons}
              selectedWeapon={selectedWeapon}
              onSelectWeapon={handleSelectWeapon}
            />
          )}
        </div>

        {showUpdateCheckbox && (
          <div className="mt-4">
            <Checkbox checked={shouldUpdate} onChange={() => setShouldUpdate(!shouldUpdate)}>
              <span>Also update the selected weapon</span>
            </Checkbox>
          </div>
        )}
      </div>
    </SavingStepLayout>
  );
}

type CaseCurrentWeaponProps = {
  currentWeapon: Weapon;
  isOldVersion: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

function CaseCurrentWeapon({
  currentWeapon,
  isOldVersion,
  selected,
  onSelect,
}: CaseCurrentWeaponProps) {
  return (
    <SavingCase
      message={`${currentWeapon.owner} is currently equipped with this Weapon.`}
      hint={
        <span>
          Select <b>Skip</b> to keep using it{isOldVersion && ", or select it to update"}.
        </span>
      }
      withDivider
    >
      <WeaponSummary
        variant="primary"
        label={`Current: ${currentWeapon.data.name}`}
        weapon={currentWeapon}
        selectable={isOldVersion}
        selected={selected}
        onSelect={onSelect}
      />
    </SavingCase>
  );
}

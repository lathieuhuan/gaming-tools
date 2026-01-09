import { RefCallback, useState } from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { ButtonProps, Checkbox, OverflowTrackingContainer } from "rond";

import type { IWeaponBasic } from "@/types";
import type { SaveOutput, WeaponSavingStep } from "./_types";

import { genNewEntityMessage, genSameEntityMessage, CONTINUE_MSG } from "../_config";

import { EquipmentIcon } from "@/assets/icons";
import { EntityComparer } from "../_components/EntityComparer";
import { SavingStepLayout } from "../_components/SavingStepLayout";
import { WeaponCompareMenu } from "../_components/WeaponCompareMenu";
import { WeaponSummary } from "../_components/WeaponSummary";
import { isExactWeapon } from "../_utils";
import { WeaponSaver } from "../_components/WeaponSaver";

export type SaveWeaponStepProps = {
  className?: string;
  step: WeaponSavingStep;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onAction: (output: NonNullable<SaveOutput["weapon"]>) => void;
};

export function SaveWeaponStep({ className, step, ctaRef, onAction }: SaveWeaponStepProps) {
  const { data: weapon } = step;
  const [selectedWeapon, setSelectedWeapon] = useState<IWeaponBasic>();
  const [shouldUpdate, setShouldUpdate] = useState(true);

  const isDifferentToWeapon = (comparedWeapon: IWeaponBasic) => {
    return !isExactWeapon(comparedWeapon, weapon);
  };

  const handleSelectSameWeapon = (weapon: IWeaponBasic) => {
    setSelectedWeapon(weapon);
  };

  const handleUpdate = (weapon: IWeaponBasic) => {
    onAction?.({
      action: "UPDATE",
      weapon,
    });
  };

  const { actions, continueText, showUpdateCheckbox } = getLayoutConfig(step, selectedWeapon);

  return (
    <SavingStepLayout
      className={className}
      actions={actions}
      continueText={continueText}
      onContinue={() => {
        onAction?.({
          action: "NONE",
          weapon: weapon.serialize(),
        });
      }}
    >
      <div className="h-full flex flex-col justify-between">
        <OverflowTrackingContainer className="grow custom-scrollbar" overflowedCls="pr-2">
          <WeaponSaver
            {...step}
            sameWeaponsAreWithoutOwner
            weapon={weapon}
            selectedWeapon={selectedWeapon}
            onSelectWeapon={handleSelectSameWeapon}
          />
        </OverflowTrackingContainer>

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

const getLayoutConfig = (
  { data: weapon, currentWeapon, sameWeapons }: WeaponSavingStep,
  selectedWeapon?: IWeaponBasic
) => {
  let actions: ButtonProps[] = [];
  let continueText: string | undefined;
  let showUpdateCheckbox = selectedWeapon && !isExactWeapon(selectedWeapon, weapon);

  if (currentWeapon || sameWeapons.length) {
    const currentWeaponIsSelected = currentWeapon && currentWeapon.ID === selectedWeapon?.ID;
    const firstAction: ButtonProps = currentWeaponIsSelected
      ? {
          children: "Update",
          icon: <MdEdit />,
        }
      : {
          children: "Equip",
          icon: <EquipmentIcon className="text-xl" />,
        };

    actions.push({
      ...firstAction,
      hidden: !selectedWeapon,
    });

    showUpdateCheckbox = showUpdateCheckbox && !currentWeaponIsSelected;
  }

  return {
    actions,
    continueText,
    showUpdateCheckbox,
  };
};

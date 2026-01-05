import { RefCallback, useState } from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Checkbox } from "rond";

import type { IWeaponBasic } from "@/types";
import type { SaveOutput, WeaponSavingStep } from "./_types";

import { genNewEntityMessage, genSameEntityMessage, CONTINUE_MSG } from "../_config";

import { EquipmentIcon } from "@/assets/icons";
import { EntityComparer } from "../_components/EntityComparer";
import { SavingStepLayout } from "../_components/SavingStepLayout";
import { WeaponCompareMenu } from "../_components/WeaponCompareMenu";
import { WeaponSummary } from "../_components/WeaponSummary";
import { isExactWeapon } from "../_utils";

export type SaveWeaponStepProps = {
  className?: string;
  step: WeaponSavingStep;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onAction: (output: NonNullable<SaveOutput["weapon"]>) => void;
};

export function SaveWeaponStep({ className, step, ctaRef, onAction }: SaveWeaponStepProps) {
  const { config, data: weapon } = step;
  const [selectedWeapon, setSelectedWeapon] = useState<IWeaponBasic>();
  const [shouldUpdate, setShouldUpdate] = useState(true);

  const handleSelectSameWeapon = (weapon: IWeaponBasic) => {
    setSelectedWeapon(weapon);
    setShouldUpdate(true);
  };

  switch (config.instruct) {
    case "CONTINUABLE": {
      const isNew = config.status === "NEW";
      const message = isNew
        ? genNewEntityMessage("Weapon")
        : `${weapon.owner} is currently equipped with this weapon and it is unchanged.`;

      return (
        <SavingStepLayout
          className={className}
          message={`${message} ${CONTINUE_MSG}`}
          continueRef={ctaRef}
          onContinue={() => {
            onAction?.({
              action: isNew ? "CREATE" : "NONE",
              weapon: weapon.serialize(),
            });
          }}
        >
          <WeaponSummary label={weapon.data.name} weapon={weapon} />
        </SavingStepLayout>
      );
    }

    case "EQUIPPABLE": {
      const { currentWeapon } = config;

      const handleEquip = () => {
        if (selectedWeapon) {
          onAction?.({
            action: "UPDATE",
            weapon: shouldUpdate
              ? {
                  ...weapon.serialize(),
                  ID: selectedWeapon.ID,
                }
              : selectedWeapon,
          });
        }
      };

      const message = genSameEntityMessage("Weapon");

      return (
        <SavingStepLayout
          className={className}
          actions={[
            {
              children: "Equip",
              icon: <EquipmentIcon className="text-xl" />,
              disabled: !selectedWeapon,
              onClick: handleEquip,
            },
            {
              children: "Add new",
              icon: <FaPlus />,
              onClick: () => {
                onAction?.({
                  action: "CREATE",
                  weapon: weapon.serialize(),
                });
              },
            },
          ]}
          continueProps={{
            children: "Skip",
            hidden: !currentWeapon,
          }}
          onContinue={() => {
            onAction?.({
              action: "NONE",
              weapon: weapon.serialize(),
            });
          }}
        >
          <div className="h-full flex flex-col">
            {currentWeapon && (
              <div>
                <p className="mb-2 text-light-3 text-sm">
                  {weapon.owner} is currently equipped with the following weapon. This step can be
                  skipped.
                </p>
                <WeaponSummary label={currentWeapon.data.name} weapon={currentWeapon} />

                <div className="mx-auto my-4 h-px w-1/2 bg-dark-line" />
              </div>
            )}

            <p className="text-light-3 text-sm">{message.main}</p>
            <p className="mt-1 text-light-hint text-sm">{message.hint}</p>

            <WeaponCompareMenu
              className="grow custom-scrollbar"
              weapon={weapon}
              sameWeapons={config.sameWeapons}
              onSelect={handleSelectSameWeapon}
            />

            {selectedWeapon && !isExactWeapon(selectedWeapon, weapon) && (
              <div>
                <Checkbox checked={shouldUpdate} onChange={() => setShouldUpdate(!shouldUpdate)}>
                  <span>Also update the selected weapon</span>
                </Checkbox>
              </div>
            )}
          </div>
        </SavingStepLayout>
      );
    }

    case "COMPARABLE": {
      const { isSame, currentWeapon } = config;
      const message = isSame
        ? `${weapon.owner} is currently equipped with a different version of this weapon.`
        : `${weapon.owner} is currently equipped with a different weapon.`;

      const handleUpdate = () => {
        onAction?.({
          action: "UPDATE",
          weapon: {
            ...weapon.serialize(),
            ID: currentWeapon.ID,
          },
        });
      };

      return (
        <SavingStepLayout
          className={className}
          message={message}
          actions={[
            isSame
              ? {
                  children: "Update",
                  icon: <MdEdit />,
                  onClick: handleUpdate,
                }
              : {
                  children: "Add & Switch",
                  icon: <FaSyncAlt />,
                  onClick: () => {
                    onAction?.({
                      action: "CREATE",
                      weapon: weapon.serialize(),
                    });
                  },
                },
          ]}
          continueText={isSame ? "Keep" : "Skip"}
          onContinue={() => {
            onAction?.({
              action: "NONE",
              weapon: weapon.serialize(),
            });
          }}
        >
          <EntityComparer
            items={[
              {
                label: "Current",
                children: <WeaponSummary label={weapon.data.name} weapon={currentWeapon} />,
              },
              {
                label: "To be saved",
                children: <WeaponSummary label={weapon.data.name} weapon={weapon} />,
              },
            ]}
          />
        </SavingStepLayout>
      );
    }
  }
}

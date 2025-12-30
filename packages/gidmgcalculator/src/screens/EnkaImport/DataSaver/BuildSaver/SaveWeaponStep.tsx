import { RefCallback, useState } from "react";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Checkbox } from "rond";

import type { IWeaponBasic } from "@/types";
import type { SaveOutput, WeaponSavingStep } from "./_types";

import { genNewEntityMessage, genSimilarEntityMessage, LETS_CONTINUE_MSG } from "../_config";

import { EquipmentIcon } from "@/assets/icons";
import { EntityComparer } from "../_components/EntityComparer";
import { SavingStepLayout } from "../_components/SavingStepLayout";
import { WeaponCompareMenu } from "../_components/WeaponCompareMenu";
import { WeaponSummary } from "../_components/WeaponSummary";

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

  const isChanged = (weapon1: IWeaponBasic, weapon2: IWeaponBasic) => {
    return weapon1.level !== weapon2.level || weapon1.refi !== weapon2.refi;
  };

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
          message={`${message} ${LETS_CONTINUE_MSG}`}
          continueRef={ctaRef}
          onContinue={() => {
            onAction?.({
              action: isNew ? "CREATE" : "NONE",
              weapon: weapon.serialize(),
            });
          }}
        >
          <WeaponSummary className="p-4 rounded-md bg-dark-1" weapon={weapon} />
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
                <WeaponSummary className="p-4 rounded-md bg-dark-1" weapon={currentWeapon} />

                <div className="mx-auto my-4 h-px w-1/2 bg-dark-line" />
              </div>
            )}

            <p className="mb-3 text-light-3 text-sm">{genSimilarEntityMessage("Weapon", true)}</p>

            <WeaponCompareMenu
              className="grow custom-scrollbar"
              weapon={weapon}
              sameWeapons={config.sameWeapons}
              onSelect={handleSelectSameWeapon}
            />

            {selectedWeapon && isChanged(selectedWeapon, weapon) && (
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
                children: (
                  <WeaponSummary className="p-4 rounded-md bg-dark-1" weapon={currentWeapon} />
                ),
              },
              {
                label: "To be saved",
                children: <WeaponSummary className="p-4 rounded-md bg-dark-1" weapon={weapon} />,
              },
            ]}
          />
        </SavingStepLayout>
      );
    }
  }
}

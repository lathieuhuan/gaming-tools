import { useEffect, useState } from "react";
import { ButtonGroup, type ClassValue, clsx, RaritySelect, useValues } from "rond";

import type { WeaponType } from "@/types";
import { FilterTemplate } from "@/components/FilterTemplate";
import { WeaponTypeSelect } from "../WeaponTypeSelect";

export type WeaponFilterState = {
  types: WeaponType[];
  rarities: number[];
};

export type WeaponFilterProps = {
  className?: ClassValue;
  initialFilter?: WeaponFilterState;
  withTypeSelect?: boolean;
  disabledCancel?: boolean;
  onCancel: () => void;
  onConfirm: (filter: WeaponFilterState) => void;
};

export function WeaponFilter({
  className,
  initialFilter,
  withTypeSelect = true,
  disabledCancel,
  onCancel,
  onConfirm,
}: WeaponFilterProps) {
  // This filter is put on a drawer, the auto-focused button somehow makes the UI weirdly shift
  // when the drawer is coming out, so we render the button group later
  const [showActions, setShowActions] = useState(false);

  const {
    values: weaponTypes,
    toggle: toggleWeaponType,
    update: updateWeaponTypes,
  } = useValues({
    initial: initialFilter?.types,
    multiple: true,
  });

  const {
    values: rarities,
    toggle: toggleRarity,
    update: updateRarities,
  } = useValues({
    initial: initialFilter?.rarities,
    multiple: true,
  });

  useEffect(() => {
    setTimeout(() => {
      setShowActions(true);
    }, 250);
  }, []);

  const handleConfirm = () => {
    onConfirm({
      types: weaponTypes,
      rarities,
    });
  };

  return (
    <div className={clsx("p-4 bg-dark-1 flex flex-col", className)}>
      <div className="grow space-y-4 hide-scrollbar">
        {withTypeSelect ? (
          <>
            <FilterTemplate
              title="Filter by Type"
              clearAllDisabled={!weaponTypes.length}
              onClearAll={() => updateWeaponTypes([])}
            >
              <WeaponTypeSelect className="px-1" values={weaponTypes} onSelect={toggleWeaponType} />
            </FilterTemplate>

            <div className="w-full h-px bg-dark-line" />
          </>
        ) : null}

        <FilterTemplate
          title="Filter by Rarity"
          clearAllDisabled={!rarities.length}
          onClearAll={() => updateRarities([])}
        >
          <RaritySelect
            style={{ maxWidth: "14rem" }}
            options={[5, 4, 3, 2, 1]}
            values={rarities}
            onSelect={toggleRarity}
          />
        </FilterTemplate>
      </div>

      {showActions && (
        <ButtonGroup.Confirm
          className="mt-4"
          justify="end"
          focusConfirm
          cancelButtonProps={{
            disabled: disabledCancel,
          }}
          onCancel={onCancel}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

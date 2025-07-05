import { useEffect, useState } from "react";
import { clsx, useRaritySelect, ButtonGroup, type ClassValue } from "rond";
import { WeaponType } from "@Calculation";

import { useWeaponTypeSelect } from "@Src/hooks";
import { FilterTemplate } from "@Src/components";

export type WeaponFilterState = {
  types: WeaponType[];
  rarities: number[];
};

export interface WeaponFilterProps {
  className?: ClassValue;
  initialFilter?: WeaponFilterState;
  withTypeSelect?: boolean;
  disabledCancel?: boolean;
  onCancel: () => void;
  onDone: (filter: WeaponFilterState) => void;
}
export function WeaponFilter({
  className,
  initialFilter,
  withTypeSelect = true,
  disabledCancel,
  onCancel,
  onDone,
}: WeaponFilterProps) {
  // This filter is put on a drawer, the auto-focused button somehow makes the UI weirdly shift
  // when the drawer is coming out, so we render the button group later
  const [showActions, setShowActions] = useState(false);

  const { weaponTypes, weaponTypeSelectProps, updateWeaponTypes, WeaponTypeSelect } = useWeaponTypeSelect(
    initialFilter?.types,
    {
      multiple: true,
    }
  );
  const { selectedRarities, raritySelectProps, updateRarities, RaritySelect } = useRaritySelect(
    [5, 4, 3, 2, 1],
    initialFilter?.rarities
  );

  useEffect(() => {
    setTimeout(() => {
      setShowActions(true);
    }, 250);
  }, []);

  const onConfirm = () => {
    onDone({
      types: weaponTypes,
      rarities: selectedRarities,
    });
  };

  return (
    <div className={clsx("p-4 bg-surface-1 flex flex-col", className)}>
      <div className="grow space-y-4 hide-scrollbar">
        {withTypeSelect ? (
          <>
            <FilterTemplate
              title="Filter by Type"
              disabledClearAll={!weaponTypes.length}
              onClickClearAll={() => updateWeaponTypes([])}
            >
              <WeaponTypeSelect {...weaponTypeSelectProps} className="px-1" />
            </FilterTemplate>

            <div className="w-full h-px bg-surface-border" />
          </>
        ) : null}

        <FilterTemplate
          title="Filter by Rarity"
          disabledClearAll={!selectedRarities.length}
          onClickClearAll={() => updateRarities([])}
        >
          <RaritySelect {...raritySelectProps} style={{ maxWidth: "14rem" }} />
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
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}

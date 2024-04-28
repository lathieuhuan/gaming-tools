import { clsx, useRaritySelect, ButtonGroup, type ClassValue } from "rond";

import type { WeaponType } from "@Backend";
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
  const { weaponTypes, updateWeaponTypes, renderWeaponTypeSelect } = useWeaponTypeSelect(initialFilter?.types, {
    multiple: true,
  });
  const { selectedRarities, updateRarities, renderRaritySelect } = useRaritySelect(
    [5, 4, 3, 2, 1],
    initialFilter?.rarities
  );

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
              {renderWeaponTypeSelect("px-1")}
            </FilterTemplate>

            <div className="w-full h-px bg-surface-border" />
          </>
        ) : null}

        <FilterTemplate
          title="Filter by Rarity"
          disabledClearAll={!selectedRarities.length}
          onClickClearAll={() => updateRarities([])}
        >
          {renderRaritySelect(undefined, { maxWidth: "14rem" })}
        </FilterTemplate>
      </div>

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
    </div>
  );
}

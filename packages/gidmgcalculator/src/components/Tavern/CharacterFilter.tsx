import { ELEMENT_TYPES, ElementType, WeaponType } from "@Calculation";
import { useEffect, useState } from "react";
import { ButtonGroup, clsx, useIconSelect, useRaritySelect, type ClassValue } from "rond";

import { ElementIcon } from "@/components/ElementIcon";
import { FilterTemplate } from "@/components/FilterTemplate";
import { useWeaponTypeSelect } from "@/hooks";

export type CharacterFilterState = {
  weaponTypes: WeaponType[];
  elementTypes: ElementType[];
  rarities: number[];
};

type CharacterFilterProps = {
  className?: ClassValue;
  initialFilter?: CharacterFilterState;
  onConfirm: (filter: CharacterFilterState) => void;
  onCancel: () => void;
};

export function CharacterFilter({
  className,
  initialFilter,
  onCancel,
  onConfirm,
}: CharacterFilterProps) {
  // This filter is put on a drawer, the auto-focused button somehow makes the UI weirdly shift
  // when the drawer is coming out, so we render the button group later
  const [showActions, setShowActions] = useState(false);

  const ELEMENT_ICONS = ELEMENT_TYPES.map((value) => {
    return {
      value,
      icon: <ElementIcon type={value} />,
    };
  });

  const {
    selectedIcons: elementTypes,
    selectProps: elementSelectProps,
    updateSelectedIcons: updateElementTypes,
    IconSelect: ElementSelect,
  } = useIconSelect(ELEMENT_ICONS, initialFilter?.elementTypes, {
    multiple: true,
  });

  const { weaponTypes, weaponTypeSelectProps, updateWeaponTypes, WeaponTypeSelect } =
    useWeaponTypeSelect(initialFilter?.weaponTypes, {
      multiple: true,
    });

  const { selectedRarities, raritySelectProps, updateRarities, RaritySelect } = useRaritySelect(
    [5, 4],
    initialFilter?.rarities
  );

  useEffect(() => {
    setTimeout(() => {
      setShowActions(true);
    }, 250);
  }, []);

  const handleConfirm = () => {
    onConfirm({
      weaponTypes,
      elementTypes,
      rarities: selectedRarities,
    });
  };

  return (
    <div className={clsx("px-3 py-4 bg-surface-1 flex flex-col", className)}>
      <div className="grow space-y-4 hide-scrollbar">
        <FilterTemplate
          title="Filter by Element"
          clearAllDisabled={!elementTypes.length}
          onClearAll={() => updateElementTypes([])}
        >
          <div className="hide-scrollbar">
            <ElementSelect
              {...elementSelectProps}
              className="p-1"
              iconCls="text-2xl"
              selectedCls="shadow-3px-3px shadow-active-color"
            />
          </div>
        </FilterTemplate>

        <div className="w-full h-px bg-surface-border" />

        <FilterTemplate
          title="Filter by Weapon"
          clearAllDisabled={!weaponTypes.length}
          onClearAll={() => updateWeaponTypes([])}
        >
          <WeaponTypeSelect
            {...weaponTypeSelectProps}
            className="px-1"
            imageProps={{
              defaultFallback: { cls: "p-1.5" },
            }}
          />
        </FilterTemplate>

        <div className="w-full h-px bg-surface-border" />

        <FilterTemplate
          title="Filter by Rarity"
          clearAllDisabled={!selectedRarities.length}
          onClearAll={() => updateRarities([])}
        >
          <RaritySelect {...raritySelectProps} style={{ maxWidth: "14rem" }} />
        </FilterTemplate>
      </div>

      {showActions && (
        <ButtonGroup.Confirm
          className="mt-4"
          justify="end"
          focusConfirm
          onCancel={onCancel}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

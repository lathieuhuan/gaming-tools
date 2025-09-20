import { ElementType, WeaponType } from "@Calculation";
import { useEffect, useState } from "react";
import { ButtonGroup, clsx, RaritySelect, useValues, type ClassValue } from "rond";

import { FilterTemplate } from "@/components/FilterTemplate";
import { WeaponTypeSelect } from "../WeaponTypeSelect";
import { ElementSelect } from "./ElementSelect";

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

  const {
    values: elementTypes,
    toggle: toggleElementType,
    update: updateElementTypes,
  } = useValues({
    initial: initialFilter?.elementTypes,
    multiple: true,
  });

  const {
    values: weaponTypes,
    toggle: toggleWeaponType,
    update: updateWeaponTypes,
  } = useValues({
    initial: initialFilter?.weaponTypes,
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
      weaponTypes,
      elementTypes,
      rarities,
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
            <ElementSelect values={elementTypes} onSelect={toggleElementType} />
          </div>
        </FilterTemplate>

        <div className="w-full h-px bg-surface-border" />

        <FilterTemplate
          title="Filter by Weapon"
          clearAllDisabled={!weaponTypes.length}
          onClearAll={() => updateWeaponTypes([])}
        >
          <WeaponTypeSelect
            className="px-1"
            imageProps={{
              defaultFallback: { cls: "p-1.5" },
            }}
            values={weaponTypes}
            onSelect={toggleWeaponType}
          />
        </FilterTemplate>

        <div className="w-full h-px bg-surface-border" />

        <FilterTemplate
          title="Filter by Rarity"
          clearAllDisabled={!rarities.length}
          onClearAll={() => updateRarities([])}
        >
          <RaritySelect
            style={{ maxWidth: "14rem" }}
            values={rarities}
            options={[5, 4]}
            onSelect={toggleRarity}
          />
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

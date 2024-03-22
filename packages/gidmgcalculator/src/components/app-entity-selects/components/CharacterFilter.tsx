import { clsx, useIconSelect, useRaritySelect, ButtonGroup, type ClassValue } from "rond";

import type { ElementType, WeaponType } from "@Src/types";
import { ELEMENT_TYPES } from "@Src/constants";
import { useWeaponTypeSelect } from "@Src/hooks";
import { ElementIcon, FilterTemplate } from "@Src/components";

export type CharacterFilterState = {
  weaponTypes: WeaponType[];
  elementTypes: ElementType[];
  rarities: number[];
};

interface CharacterFilterProps {
  className?: ClassValue;
  initialFilter?: CharacterFilterState;
  onDone: (filter: CharacterFilterState) => void;
  onCancel: () => void;
}
export function CharacterFilter({ className, initialFilter, onCancel, onDone }: CharacterFilterProps) {
  const ELEMENT_ICONS = ELEMENT_TYPES.map((value) => {
    return {
      value,
      icon: <ElementIcon type={value} />,
    };
  });

  const {
    selectedIcons: elementTypes,
    updateSelectedIcons: updateElementTypes,
    renderIconSelect: renderElementSelect,
  } = useIconSelect(ELEMENT_ICONS, initialFilter?.elementTypes, {
    multiple: true,
    iconCls: "text-2xl",
    selectedCls: "shadow-3px-3px shadow-green-200",
  });

  const { weaponTypes, updateWeaponTypes, renderWeaponTypeSelect } = useWeaponTypeSelect(initialFilter?.weaponTypes, {
    multiple: true,
  });

  const { selectedRarities, updateRarities, renderRaritySelect } = useRaritySelect([5, 4], initialFilter?.rarities);

  const onConfirm = () => {
    onDone({
      weaponTypes,
      elementTypes,
      rarities: selectedRarities,
    });
  };

  return (
    <div className={clsx("px-3 py-4 bg-dark-900 flex flex-col", className)}>
      <div className="grow space-y-4 hide-scrollbar">
        <FilterTemplate
          title="Filter by Element"
          disabledClearAll={!elementTypes.length}
          onClickClearAll={() => updateElementTypes([])}
        >
          <div className="hide-scrollbar">{renderElementSelect("p-1")}</div>
        </FilterTemplate>

        <div className="w-full h-px bg-dark-300" />

        <FilterTemplate
          title="Filter by Weapon"
          disabledClearAll={!weaponTypes.length}
          onClickClearAll={() => updateWeaponTypes([])}
        >
          {renderWeaponTypeSelect("px-1", { defaultFallback: { cls: "p-1.5" } })}
        </FilterTemplate>

        <div className="w-full h-px bg-dark-300" />

        <FilterTemplate
          title="Filter by Rarity"
          disabledClearAll={!selectedRarities.length}
          onClickClearAll={() => updateRarities([])}
        >
          {renderRaritySelect(undefined, { maxWidth: "14rem" })}
        </FilterTemplate>
      </div>

      <ButtonGroup.Confirm className="mt-4" justify="end" focusConfirm onCancel={onCancel} onConfirm={onConfirm} />
    </div>
  );
}

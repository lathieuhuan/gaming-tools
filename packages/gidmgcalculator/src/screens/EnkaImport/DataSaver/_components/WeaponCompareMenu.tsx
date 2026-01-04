import { useState } from "react";

import type { Weapon } from "@/models/base";
import type { IWeaponBasic } from "@/types";

import { ItemSaveOption } from "./ItemSaveOption";
import { WeaponSubtitle } from "./WeaponSummary";

type WeaponCompareMenuProps = {
  className?: string;
  weapon: Weapon;
  sameWeapons: IWeaponBasic[];
  onSelect?: (weapon: IWeaponBasic) => void;
};

export function WeaponCompareMenu({ className, weapon, sameWeapons, onSelect }: WeaponCompareMenuProps) {
  const [selectedId, setSelectedId] = useState<number>();

  const handleSelect = (weapon: IWeaponBasic) => {
    setSelectedId(weapon.ID);
    onSelect?.(weapon);
  };

  return (
    <div className={className}>
      <div className="mb-2">
        <p className="text-primary-1 font-semibold">{weapon.data.name}</p>
        <WeaponSubtitle item={weapon} />
      </div>

      <div className="space-y-2">
        {sameWeapons.map((item, index) => {
          return (
            <ItemSaveOption
              key={item.ID}
              label={`Weapon ${index + 1}`}
              item={item}
              className="relative"
              selected={selectedId === item.ID}
              onSelect={() => handleSelect(item)}
            >
              <WeaponSubtitle item={item} />
            </ItemSaveOption>
          );
        })}
      </div>
    </div>
  );
}

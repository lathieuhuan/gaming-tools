import { Button, notification } from "rond";

import type { Weapon } from "@/models/base";
import type { IWeaponBasic } from "@/types";

import { useDispatch } from "@Store/hooks";
import { updateUserWeapon } from "@Store/userdb-slice";

import { ItemSaveOption } from "../_components/ItemSaveOption";

export function WeaponSub({ item }: { item: IWeaponBasic }) {
  return (
    <div className="text-sm text-light-4 flex items-center gap-2">
      <span>Level: {item.level}</span>
      <span className="text-dark-line">|</span>
      <span>Refinement: {item.refi}</span>
    </div>
  );
}

type WeaponSaveMenuProps = {
  items: IWeaponBasic[];
  weapon: Weapon;
  onUpdate?: (item: IWeaponBasic) => void;
};

export function WeaponSaveMenu({ items, weapon, onUpdate }: WeaponSaveMenuProps) {
  const dispatch = useDispatch();

  const isDifferent = (item: IWeaponBasic) => {
    return item.level !== weapon.level || item.refi !== weapon.refi;
  };

  const handleUpdate = (item: IWeaponBasic) => {
    dispatch(
      updateUserWeapon({
        ID: item.ID,
        level: weapon.level,
        refi: weapon.refi,
      })
    );

    notification.success({
      content: "Weapon updated successfully!",
    });
    onUpdate?.(item);
  };

  return (
    <div>
      <div className="mb-2">
        <p className="text-primary-1 font-semibold">{weapon.data.name}</p>
        <WeaponSub item={weapon} />
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          return (
            <ItemSaveOption
              key={item.ID}
              label={`Weapon ${index + 1}`}
              item={item}
              className="relative"
            >
              <WeaponSub item={item} />

              {isDifferent(item) && (
                <Button
                  size="small"
                  className="absolute top-4 right-4"
                  onClick={() => handleUpdate(item)}
                >
                  Update
                </Button>
              )}
            </ItemSaveOption>
          );
        })}
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { EntitySelectTemplate, FancyBackSvg, Modal } from "rond";

import type { RawWeapon, WeaponType } from "@/types";

import { useStoreSnapshot } from "@/lib/dynamic-store";
import { createWeapon } from "@/logic/entity.logic";
import { Weapon } from "@/models";
import { selectDbWeapons } from "@Store/userdbSlice";

// Component
import { InventoryRack, ItemOption } from "../InventoryRack";
import { WeaponCard } from "../WeaponCard";

type WeaponInventoryProps = {
  weaponType: WeaponType;
  owner?: number | null;
  buttonText: string;
  onClickButton: (selectedWeapon: Weapon) => void;
  onClose: () => void;
};

const WeaponInventoryCore = ({
  weaponType,
  owner,
  buttonText,
  onClickButton,
  onClose,
}: WeaponInventoryProps) => {
  const items = useStoreSnapshot((state) =>
    selectDbWeapons(state).filter((weapon) => weapon.type === weaponType)
  );

  const bodyRef = useRef<HTMLDivElement>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>();

  const onChangeItem = (option?: ItemOption<RawWeapon>) => {
    if (option) {
      if (!selectedWeapon || option.userData.ID !== selectedWeapon.ID) {
        setSelectedWeapon(createWeapon(option.userData, option.data));
      }

      if (bodyRef.current) {
        bodyRef.current.scrollLeft = 9999;
      }

      return;
    }

    setSelectedWeapon(undefined);
  };

  const isCurrentSelected = selectedWeapon?.owner && selectedWeapon.owner === owner;

  return (
    <EntitySelectTemplate title="Weapon Inventory" onClose={onClose}>
      {() => {
        return (
          <div ref={bodyRef} className="h-full flex custom-scrollbar gap-2 scroll-smooth">
            <InventoryRack
              data={items}
              itemCls="max-w-1/3 basis-1/3 md:w-1/4 md:basis-1/4 lg:max-w-1/6 lg:basis-1/6"
              emptyText="No weapons found"
              activeId={selectedWeapon?.ID}
              onChangeItem={onChangeItem}
            />
            <WeaponCard
              wrapperCls="w-76 shrink-0"
              weapon={selectedWeapon}
              withActions={!!selectedWeapon}
              withOwnerLabel
              actions={[
                {
                  icon: <FancyBackSvg />,
                  className: "sm:hidden",
                  onClick: () => {
                    if (bodyRef.current) bodyRef.current.scrollLeft = 0;
                  },
                },
                {
                  children: buttonText,
                  variant: "primary",
                  className: isCurrentSelected && "hidden",
                  onClick: (_, weapon) => {
                    onClickButton(weapon);
                    onClose();
                  },
                },
              ]}
            />
          </div>
        );
      }}
    </EntitySelectTemplate>
  );
};

export const WeaponInventory = Modal.coreWrap(WeaponInventoryCore, { preset: "large" });

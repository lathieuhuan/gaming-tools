import { useRef, useState } from "react";
import { EntitySelectTemplate, FancyBackSvg, Modal } from "rond";

import type { IWeaponBasic, WeaponType } from "@/types";

import { Weapon } from "@/models/base";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import { selectDbWeapons } from "@Store/userdb-slice";

// Component
import { InventoryRack, ItemOption } from "../InventoryRack";
import { WeaponCard } from "../WeaponCard";

type WeaponInventoryProps = {
  weaponType: WeaponType;
  owner?: string | null;
  buttonText: string;
  onClickButton: (chosen: Weapon) => void;
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
  const [chosenWeapon, setChosenWeapon] = useState<Weapon>();

  const onChangeItem = (option?: ItemOption<IWeaponBasic>) => {
    if (option) {
      if (!chosenWeapon || option.userData.ID !== chosenWeapon.ID) {
        setChosenWeapon(new Weapon(option.userData, option.data));
      }

      if (bodyRef.current) {
        bodyRef.current.scrollLeft = 9999;
      }

      return;
    }

    setChosenWeapon(undefined);
  };

  const chosenIsCurrent = chosenWeapon && chosenWeapon.owner === owner;

  return (
    <EntitySelectTemplate title="Weapon Inventory" onClose={onClose}>
      {() => {
        return (
          <div ref={bodyRef} className="h-full flex custom-scrollbar gap-2 scroll-smooth">
            <InventoryRack
              data={items}
              itemCls="max-w-1/3 basis-1/3 md:w-1/4 md:basis-1/4 lg:max-w-1/6 lg:basis-1/6"
              emptyText="No weapons found"
              chosenID={chosenWeapon?.ID}
              onChangeItem={onChangeItem}
            />
            <WeaponCard
              wrapperCls="w-76 shrink-0"
              weapon={chosenWeapon}
              withActions={!!chosenWeapon}
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
                  className: chosenIsCurrent && "hidden",
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

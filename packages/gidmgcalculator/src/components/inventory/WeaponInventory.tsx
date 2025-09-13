import { useRef, useState } from "react";
import { EntitySelectTemplate, FancyBackSvg, Modal } from "rond";

import type { UserWeapon } from "@/types";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import { WeaponType } from "@Calculation";
import { selectUserWeapons } from "@Store/userdb-slice";

// Component
import { WeaponCard } from "../WeaponCard";
import { InventoryRack } from "./InventoryRack";

interface WeaponInventoryProps {
  weaponType: WeaponType;
  owner?: string | null;
  buttonText: string;
  onClickButton: (chosen: UserWeapon) => void;
  onClose: () => void;
}
const WeaponInventoryCore = ({ weaponType, owner, buttonText, onClickButton, onClose }: WeaponInventoryProps) => {
  const items = useStoreSnapshot((state) => selectUserWeapons(state).filter((weapon) => weapon.type === weaponType));

  const bodyRef = useRef<HTMLDivElement>(null);
  const [chosenWeapon, setChosenWeapon] = useState<UserWeapon>();

  const onChangeItem = (weapon?: UserWeapon) => {
    if (weapon) {
      if (!chosenWeapon || weapon.ID !== chosenWeapon.ID) {
        setChosenWeapon(weapon);
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

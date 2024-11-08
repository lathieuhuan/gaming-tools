import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { Button, Modal, EntitySelectTemplate } from "rond";

import type { UserArtifact, UserWeapon } from "@Src/types";
import Entity_ from "@Src/utils/entity-utils";

// Component
import { ArtifactCard } from "../ArtifactCard";
import { WeaponCard } from "../WeaponCard";
import { InventoryRack } from "./InventoryRack";

interface ItemMultiSelectProps {
  title: string;
  items: UserWeapon[] | UserArtifact[];
  max: number;
  onClose: () => void;
  onConfirm: (chosenIDs: Record<string, boolean>) => void;
}

const ItemMultiSelectCore = (props: ItemMultiSelectProps) => {
  const [chosenItem, setChosenItem] = useState<UserWeapon | UserArtifact>();
  const [chosenIDs, setChosenIDs] = useState<Record<string, boolean>>({});

  const chosenCount = Object.values(chosenIDs).filter(Boolean).length;

  const onChangeItem = (item?: UserWeapon | UserArtifact) => {
    setChosenItem(item);

    if (item?.ID && !chosenIDs[item.ID] && props.max && chosenCount < props.max) {
      setChosenIDs((prevChosenIDs) => {
        const newChosenIDs = { ...prevChosenIDs };
        newChosenIDs[item.ID] = true;
        return newChosenIDs;
      });
    }
  };

  const onUnselectItem = (item: UserWeapon | UserArtifact) => {
    setChosenIDs((prevChosenIDs) => {
      const newChosenIDs = { ...prevChosenIDs };
      newChosenIDs[item.ID] = false;
      return newChosenIDs;
    });
  };

  return (
    <EntitySelectTemplate
      title={props.title}
      extra={
        <div className="flex items-center gap-3">
          <p className="text-base text-light-default font-bold">
            {chosenCount}/{props.max} selected
          </p>
          <Button
            variant="primary"
            icon={<FaCheck />}
            disabled={chosenCount < props.max}
            onClick={() => props.onConfirm(chosenIDs)}
          >
            Confirm
          </Button>
        </div>
      }
      onClose={props.onClose}
    >
      {() => {
        return (
          <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
            <InventoryRack
              data={props.items}
              itemCls="max-w-1/3 basis-1/3 md:w-1/4 md:basis-1/4 lg:max-w-1/6 lg:basis-1/6"
              chosenID={chosenItem?.ID || 1}
              chosenIDs={chosenIDs}
              onUnselectItem={onUnselectItem}
              onChangeItem={onChangeItem}
            />

            {chosenItem ? (
              Entity_.isUserWeapon(chosenItem) ? (
                <WeaponCard wrapperCls="w-76 shrink-0" withOwnerLabel weapon={chosenItem} />
              ) : (
                <ArtifactCard wrapperCls="w-76 shrink-0" withOwnerLabel artifact={chosenItem} />
              )
            ) : (
              <div className="w-76 rounded-lg bg-surface-1 shrink-0" />
            )}
          </div>
        );
      }}
    </EntitySelectTemplate>
  );
};

export const ItemMultiSelect = Modal.coreWrap(ItemMultiSelectCore, { preset: "large" });

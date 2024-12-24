import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { Button, Modal, EntitySelectTemplate, type EntitySelectTemplateProps } from "rond";

import type { Artifact, Weapon } from "@Src/types";
import Entity_ from "@Src/utils/entity-utils";

// Component
import { ArtifactCard } from "../ArtifactCard";
import { WeaponCard } from "../WeaponCard";
import { InventoryRack } from "./InventoryRack";

export type ItemMultiSelectIds = Set<PropertyKey>;

interface ItemMultiSelectProps<T> extends Pick<EntitySelectTemplateProps, "title" | "onClose"> {
  items: T[];
  initialValue?: ItemMultiSelectIds;
  max?: number;
  onConfirm: (selectedIds: ItemMultiSelectIds) => void;
}
function ItemMultiSelectCore<T extends Weapon | Artifact>(props: ItemMultiSelectProps<T>): JSX.Element {
  const { max, initialValue = new Set() } = props;

  const [chosenItem, setChosenItem] = useState<T>();
  const [selectedIds, setSelectedIds] = useState<ItemMultiSelectIds>(initialValue);

  const chosenCount = Object.values(selectedIds).filter(Boolean).length;

  const onChangeItem = (item: T) => {
    setChosenItem(item);

    if (item?.ID && !selectedIds.has(item.ID) && (!max || chosenCount < max)) {
      setSelectedIds((prevIds) => new Set(prevIds.add(item.ID)));
    }
  };

  const onUnselectItem = (item: T) => {
    setSelectedIds((prevIds) => {
      prevIds.delete(item.ID);
      return new Set(prevIds);
    });
  };

  return (
    <EntitySelectTemplate
      title={props.title}
      extra={
        <div className="flex items-center gap-3">
          <p className="text-right text-base text-light-default font-bold">
            {chosenCount}
            {max ? `/${max}` : ""} selected
          </p>
          <Button
            variant="primary"
            icon={<FaCheck />}
            disabled={!!max && chosenCount < max}
            onClick={() => props.onConfirm(selectedIds)}
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
              selectedIds={selectedIds}
              onUnselectItem={onUnselectItem}
              onChangeItem={onChangeItem}
            />

            {chosenItem ? (
              Entity_.isWeapon(chosenItem) ? (
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
}

export const ItemMultiSelect = Modal.coreWrap(ItemMultiSelectCore, { preset: "large" });

import { useRef, useState } from "react";
import { FaCheck, FaMinus, FaPlus } from "react-icons/fa";
import { Button, EntitySelectTemplate, type EntitySelectTemplateProps, Modal, useScreenWatcher } from "rond";

import type { Artifact, Weapon } from "@/types";
import Entity_ from "@/utils/Entity";

// Component
import { ArtifactCard } from "../ArtifactCard";
import { InventoryRack } from "../InventoryRack";
import { WeaponCard } from "../WeaponCard";

export type ItemMultiSelectIds = Set<number>;

interface ItemMultiSelectProps<T> extends Pick<EntitySelectTemplateProps, "title" | "onClose"> {
  items: T[];
  initialValue?: ItemMultiSelectIds;
  required?: number;
  onConfirm: (selectedIds: ItemMultiSelectIds) => void;
}
function ItemMultiSelectCore<T extends Weapon | Artifact>(props: ItemMultiSelectProps<T>): JSX.Element {
  const { required, initialValue = new Set() } = props;

  const bodyRef = useRef<HTMLDivElement>(null);
  const screen = useScreenWatcher();
  const [selectedItem, setSelectedItem] = useState<T>();
  const [selectedIds, setSelectedIds] = useState<ItemMultiSelectIds>(initialValue);

  const actionId = "multi-select_action";

  function getAction(item: T) {
    return selectedIds.has(item.ID)
      ? {
          id: actionId,
          children: "Unselect",
          icon: <FaMinus />,
          onClick: () => unselectItem(item, true),
        }
      : {
          id: actionId,
          children: "Select",
          icon: <FaPlus />,
          onClick: () => selectItem(item),
        };
  }

  const scrollBody = (value: number) => {
    if (bodyRef.current) {
      bodyRef.current.scrollLeft = value;
    }
  };

  const focusAction = () => {
    const action: HTMLButtonElement | null | undefined = bodyRef.current?.querySelector(`#${actionId}`);
    action?.focus();
    return !!action;
  };

  const onChangeItem = (item: T) => {
    setSelectedItem(item);
    scrollBody(9999);

    if (!focusAction()) setTimeout(focusAction, 100);
  };

  const selectItem = (item: T) => {
    if (item?.ID && !selectedIds.has(item.ID) && (!required || selectedIds.size < required)) {
      setSelectedIds((prevIds) => new Set(prevIds).add(item.ID));
    }
    scrollBody(0);
  };

  const unselectItem = (item: T, shouldScroll = false) => {
    setSelectedIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.delete(item.ID);
      return newIds;
    });

    if (shouldScroll) scrollBody(0);
  };

  return (
    <EntitySelectTemplate
      title={props.title}
      extra={
        <div className={screen.isFromSize("sm") ? "flex items-center gap-3" : "flex flex-col gap-1"}>
          <p className="text-right text-base text-light-1 font-semibold">
            {selectedIds.size}
            {required ? `/${required}` : ""} selected
          </p>
          <Button
            variant="primary"
            size="small"
            icon={<FaCheck />}
            disabled={!!required && selectedIds.size < required}
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
          <div ref={bodyRef} className="h-full flex custom-scrollbar gap-2 scroll-smooth">
            <InventoryRack
              data={props.items}
              itemCls="max-w-1/3 basis-1/3 md:w-1/4 md:basis-1/4 lg:max-w-1/6 lg:basis-1/6"
              chosenID={selectedItem?.ID || 1}
              selectedIds={selectedIds}
              onUnselectItem={unselectItem}
              onChangeItem={onChangeItem}
            />

            {selectedItem ? (
              Entity_.isWeapon(selectedItem) ? (
                <WeaponCard
                  wrapperCls="w-76 shrink-0"
                  withOwnerLabel
                  weapon={selectedItem}
                  actions={[getAction(selectedItem)]}
                />
              ) : (
                <ArtifactCard
                  wrapperCls="w-76 shrink-0"
                  withOwnerLabel
                  artifact={selectedItem}
                  actions={[getAction(selectedItem)]}
                />
              )
            ) : (
              <div className="w-76 rounded-lg bg-dark-1 shrink-0" />
            )}
          </div>
        );
      }}
    </EntitySelectTemplate>
  );
}

export const ItemMultiSelect = Modal.coreWrap(ItemMultiSelectCore, {
  preset: "large",
  className: Modal.MAX_SIZE_CLS,
});

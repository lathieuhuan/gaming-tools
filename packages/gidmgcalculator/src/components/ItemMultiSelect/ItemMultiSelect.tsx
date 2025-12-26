import { useRef, useState } from "react";
import { FaCheck, FaMinus, FaPlus } from "react-icons/fa";
import {
  Button,
  EntitySelectTemplate,
  type EntitySelectTemplateProps,
  Modal,
  useScreenWatcher,
} from "rond";

import type { IArtifactBasic, IWeaponBasic } from "@/types";
import { Artifact, Weapon } from "@/models/base";

// Component
import { ArtifactCard } from "../ArtifactCard";
import { InventoryRack, isWeapon, ItemOption } from "../InventoryRack";
import { WeaponCard } from "../WeaponCard";

export type ItemMultiSelectIds = Set<number>;

type ItemMultiSelectProps<T> = Pick<EntitySelectTemplateProps, "title" | "onClose"> & {
  items: T[];
  initialValue?: ItemMultiSelectIds;
  required?: number;
  onConfirm: (selectedIds: ItemMultiSelectIds) => void;
};

function ItemMultiSelectCore<T extends IWeaponBasic | IArtifactBasic>(
  props: ItemMultiSelectProps<T>
): JSX.Element {
  const { items, required, initialValue = new Set() } = props;

  const bodyRef = useRef<HTMLDivElement>(null);
  const screen = useScreenWatcher();
  const [selectedItem, setSelectedItem] = useState<Weapon | Artifact>();
  const [selectedIds, setSelectedIds] = useState<ItemMultiSelectIds>(initialValue);

  const actionId = "multi-select_action";

  function getAction(id: number) {
    return selectedIds.has(id)
      ? {
          id: actionId,
          children: "Unselect",
          icon: <FaMinus />,
          onClick: () => unselectItem(id, true),
        }
      : {
          id: actionId,
          children: "Select",
          icon: <FaPlus />,
          onClick: () => selectItem(id),
        };
  }

  const scrollBody = (value: number) => {
    if (bodyRef.current) {
      bodyRef.current.scrollLeft = value;
    }
  };

  const focusAction = () => {
    const action: HTMLButtonElement | null | undefined = bodyRef.current?.querySelector(
      `#${actionId}`
    );
    action?.focus();
    return !!action;
  };

  const onChangeItem = (item: ItemOption<T>) => {
    if (isWeapon(item.userData)) {
      const item_ = item as ItemOption<IWeaponBasic>;
      setSelectedItem(new Weapon(item_.userData, item_.data));
    } else {
      const item_ = item as ItemOption<IArtifactBasic>;
      setSelectedItem(new Artifact(item_.userData, item_.data));
    }

    scrollBody(9999);

    if (!focusAction()) setTimeout(focusAction, 100);
  };

  const selectItem = (id: number) => {
    if (id && !selectedIds.has(id) && (!required || selectedIds.size < required)) {
      setSelectedIds((prevIds) => new Set(prevIds).add(id));
    }
    scrollBody(0);
  };

  const unselectItem = (id: number, shouldScroll = false) => {
    setSelectedIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.delete(id);
      return newIds;
    });

    if (shouldScroll) scrollBody(0);
  };

  return (
    <EntitySelectTemplate
      title={props.title}
      extra={
        <div
          className={screen.isFromSize("sm") ? "flex items-center gap-3" : "flex flex-col gap-1"}
        >
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
              data={items}
              itemCls="max-w-1/3 basis-1/3 md:w-1/4 md:basis-1/4 lg:max-w-1/6 lg:basis-1/6"
              chosenID={selectedItem?.ID || 1}
              selectedIds={selectedIds}
              onUnselectItem={(item) => unselectItem(item.userData.ID)}
              onChangeItem={onChangeItem}
            />

            {selectedItem ? (
              isWeapon(selectedItem) ? (
                <WeaponCard
                  wrapperCls="w-76 shrink-0"
                  withOwnerLabel
                  weapon={selectedItem}
                  actions={[getAction(selectedItem.ID)]}
                />
              ) : (
                <ArtifactCard
                  wrapperCls="w-76 shrink-0"
                  withOwnerLabel
                  artifact={selectedItem}
                  actions={[getAction(selectedItem.ID)]}
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

import clsx from "clsx";
import { useState } from "react";
import { BottomSheet, type BottomSheetProps } from "../BottomSheet";
import { Input } from "../Input";
import { ButtonGroup, type ButtonProps } from "../Button";
import "./BottomList.styles.scss";

type ValueType = string | number;

export type BottomListItem = {
  label?: ValueType;
  value: ValueType;
  className?: string;
};

export interface BottomListProps extends Pick<BottomSheetProps, "active" | "height" | "onClose"> {
  /** Default to 'Select' */
  title?: React.ReactNode;
  value?: ValueType;
  items?: BottomListItem[];
  hasSearch?: boolean;
  /** Default to 'left' */
  align?: "left" | "right";
  actions?: ButtonProps[];
  renderItem?: (item: BottomListItem) => React.ReactNode;
  onSelect?: (value: ValueType) => void;
}
export function BottomList({
  title = "Select",
  value,
  items = [],
  hasSearch,
  align = "left",
  actions,
  renderItem,
  onSelect,
  ...sheetProps
}: BottomListProps) {
  const [keyword, setKeyword] = useState("");
  const shouldFilter = keyword.length > 0;
  const lowerKeyword = keyword.toLowerCase();

  return (
    <BottomSheet {...sheetProps} title={title} bodyCls="ron-list">
      {hasSearch && (
        <div className="ron-bottom-list__search">
          <Input placeholder="Search..." onChange={setKeyword} />
        </div>
      )}

      <div className="ron-bottom-list__body">
        <div>
          {items.map((item, itemIndex) => {
            const hidden = shouldFilter && !`${item.label ?? item.value}`.toLowerCase().includes(lowerKeyword);

            return (
              <div
                key={item.value}
                className={clsx(
                  `ron-bottom-list__item ron-bottom-list__item--${align}`,
                  item.value === value && "ron-bottom-list__item--active",
                  hidden && "ron-hidden"
                )}
                onClick={() => onSelect?.(item.value)}
              >
                {renderItem ? renderItem(item) : item.label ?? item.value}
              </div>
            );
          })}
        </div>
      </div>

      {actions?.length ? <ButtonGroup className="ron-bottom-list__footer" justify="end" buttons={actions} /> : null}
    </BottomSheet>
  );
}

import clsx from "clsx";
import { useState } from "react";
import { BottomSheet, type BottomSheetProps } from "../BottomSheet";
import { Input } from "../Input";
import { ButtonGroup, type ButtonProps } from "../Button";
import "./BottomList.styles.scss";

export type BottomListValue = string | number;

export type BottomListItem<
  TValue extends BottomListValue = BottomListValue,
  TData extends Record<string, unknown> = Record<string, unknown>
> = {
  label?: BottomListValue;
  value: TValue;
  data?: TData;
  className?: string;
};

export interface BottomListProps<
  TValue extends BottomListValue = BottomListValue,
  TData extends Record<string, unknown> = Record<string, unknown>
> extends Pick<BottomSheetProps, "active" | "height" | "onClose"> {
  /** Default to 'Select' */
  title?: React.ReactNode;
  value?: BottomListValue;
  items?: BottomListItem<TValue, TData>[];
  hasSearch?: boolean;
  /** Default to 'left' */
  align?: "left" | "right";
  actions?: ButtonProps[];
  renderItem?: (item: BottomListItem<TValue, TData>) => React.ReactNode;
  onSelect?: (value: TValue, item: BottomListItem<TValue, TData>) => void;
}
export function BottomList<
  TValue extends BottomListValue = BottomListValue,
  TData extends Record<string, unknown> = Record<string, unknown>
>({
  title = "Select",
  value,
  items = [],
  hasSearch,
  align = "left",
  actions,
  renderItem,
  onSelect,
  ...sheetProps
}: BottomListProps<TValue, TData>) {
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
          {items.map((item) => {
            const hidden = shouldFilter && !`${item.label ?? item.value}`.toLowerCase().includes(lowerKeyword);

            return (
              <div
                key={item.value}
                className={clsx(
                  `ron-bottom-list__item ron-bottom-list__item--${align}`,
                  item.value === value && "ron-bottom-list__item--active",
                  hidden && "ron-hidden",
                  item.className
                )}
                onClick={() => onSelect?.(item.value, item)}
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

import { cn } from "@lib/utils";
import { useState } from "react";
import { BottomSheet, type BottomSheetProps } from "../BottomSheet";
import { ButtonGroup, type ButtonProps } from "../Button";
import { Input } from "../Input";

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

export type BottomListProps<
  TValue extends BottomListValue = BottomListValue,
  TData extends Record<string, unknown> = Record<string, unknown>
> = Pick<BottomSheetProps, "active" | "height" | "onClose"> & {
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
};

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
    <BottomSheet {...sheetProps} title={title} bodyCls="flex flex-col">
      <div
        className={cn(
          "px-4 py-2 flex peer",
          !hasSearch && "hidden",
          align === "right" && "justify-end"
        )}
      >
        <Input placeholder="Search..." onChange={setKeyword} />
      </div>

      <div className="flex-grow overflow-y-auto p-4 pt-0 peer-[.hidden]:pt-2">
        <div>
          {items.map((item) => {
            const hidden =
              shouldFilter && !`${item.label ?? item.value}`.toLowerCase().includes(lowerKeyword);

            return (
              <div
                key={item.value}
                className={cn(
                  "pt-2.5 pb-1.5 text-base leading-5 text-white border-b border-dark-line",
                  align === "right" && "text-right",
                  item.value === value && "text-active",
                  hidden && "hidden",
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

      {actions?.length ? (
        <ButtonGroup className="p-4 bg-dark-3" justify="end" buttons={actions} />
      ) : null}
    </BottomSheet>
  );
}

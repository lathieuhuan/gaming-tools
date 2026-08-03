import { cn } from "@lib/utils";
import { ClassValue } from "clsx";

export type TabItemProps = Omit<React.ComponentProps<"button">, "children">;

export type TabItem<T> = {
  label: string;
  value: T;
  props?: TabItemProps;
};

export type TabsProps<V, T extends TabItem<V> = TabItem<V>> = Omit<
  React.ComponentProps<"div">,
  "onChange"
> & {
  className?: ClassValue;
  itemClassName?: ClassValue;
  items: T[];
  value: V;
  onChange?: (value: V, tab: T) => void;
};

export function Tabs<V extends string | number, T extends TabItem<V> = TabItem<V>>({
  className,
  itemClassName,
  items,
  value,
  onChange,
  ...restProps
}: TabsProps<V, T>) {
  return (
    <div className={cn("flex border-b border-heading", className)} {...restProps}>
      {items.map((tab) => (
        <button
          key={tab.value}
          {...tab.props}
          data-active={value === tab.value}
          className={cn(
            "px-2 pt-1 font-semibold rounded-t-sm text-light-2 data-[active=true]:text-black data-[active=true]:bg-heading",
            itemClassName,
            tab.props?.className,
          )}
          onClick={(e) => {
            onChange?.(tab.value, tab);
            tab.props?.onClick?.(e);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

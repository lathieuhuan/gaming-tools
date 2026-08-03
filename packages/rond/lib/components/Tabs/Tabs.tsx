import { cn } from "@lib/utils";
import { ClassValue } from "clsx";

export type TabItemProps = Omit<React.ComponentProps<"button">, "children">;

type TabSize = "sm" | "md" | "lg";

type TabVariant = "primary" | "secondary";

const SIZE_CLS: Record<TabSize, { root: string; item: string }> = {
  sm: {
    root: "text-sm",
    item: "px-2",
  },
  md: {
    root: "text-base",
    item: "px-2",
  },
  lg: {
    root: "text-lg",
    item: "px-3",
  },
};

const VARIANT_CLS: Record<TabVariant, { root: string; item: string; prefix: string }> = {
  primary: {
    root: "border-heading",
    item: "data-[active=true]:bg-heading",
    prefix: "text-heading",
  },
  secondary: {
    root: "border-secondary-1",
    item: "data-[active=true]:bg-secondary-1",
    prefix: "text-secondary-1",
  },
};

export type TabItem<T> = {
  label: string;
  value: T;
  props?: TabItemProps;
};

export type TabsProps<V, T extends TabItem<V> = TabItem<V>> = Omit<
  React.ComponentProps<"div">,
  "onChange" | "prefix"
> & {
  className?: ClassValue;
  itemClassName?: ClassValue;
  variant?: TabVariant;
  size?: TabSize;
  prefix?: React.ReactNode;
  items: T[];
  value: V;
  onChange?: (value: V, tab: T) => void;
};

export function Tabs<V extends string | number, T extends TabItem<V> = TabItem<V>>({
  className,
  itemClassName,
  variant = "primary",
  size = "md",
  prefix,
  items,
  value,
  onChange,
  ...restProps
}: TabsProps<V, T>) {
  const sizeCls = SIZE_CLS[size];
  const variantCls = VARIANT_CLS[variant];

  return (
    <div
      className={cn("flex items-end border-b", variantCls.root, sizeCls.root, className)}
      {...restProps}
    >
      {prefix != null && <div className={`mr-2 shrink-0 ${variantCls.prefix}`}>{prefix}</div>}

      {items.map((tab) => {
        const active = value === tab.value;

        return (
          <button
            key={tab.value}
            {...tab.props}
            data-active={active}
            className={cn(
              "pt-1 font-semibold rounded-t-sm",
              active ? "text-black" : "text-light-2 glow-on-hover",
              variantCls.item,
              sizeCls.item,
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
        );
      })}
    </div>
  );
}

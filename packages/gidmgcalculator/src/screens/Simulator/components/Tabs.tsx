import { clsx, cn } from "rond";

export type TabItem = {
  label: string;
  value: string;
};

type TabsProps<T extends TabItem> = {
  className?: string;
  tabs: T[];
  value: string;
  onChange?: (tab: T) => void;
};

export function Tabs<T extends TabItem>({ className, tabs, value, onChange }: TabsProps<T>) {
  return (
    <div className={cn("flex border-b border-primary-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={clsx(
            "px-2 pt-1 font-semibold rounded-t-sm",
            value === tab.value ? "text-black bg-primary-2" : "text-light-2"
          )}
          onClick={() => onChange?.(tab)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

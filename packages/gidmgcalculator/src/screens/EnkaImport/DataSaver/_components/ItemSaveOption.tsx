import { clsx, Radio, type ClassValue } from "rond";

type ItemSaveOptionProps = {
  className?: ClassValue;
  label: string;
  item: {
    ID: number;
    owner?: string;
  };
  children?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
};

export function ItemSaveOption({
  className,
  label,
  item,
  children,
  selected,
  onSelect,
}: ItemSaveOptionProps) {
  return (
    <div
      data-slot="item-save-option"
      tabIndex={-1}
      className={clsx("px-4 py-2 bg-dark-1 rounded-md relative", className)}
    >
      <div className="flex items-end gap-2">
        <span className="font-medium">{label}</span>
        {item.owner && <span className="text-light-4">({item.owner})</span>}
      </div>

      {children}

      <div className="absolute top-4 right-4">
        <Radio size="medium" checked={selected} onChange={onSelect} />
      </div>
    </div>
  );
}
